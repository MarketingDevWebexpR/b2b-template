# ADR-005: Flux d'Authentification B2B

## Statut

Accepté

## Date

2024-12-15

## Contexte

Notre plateforme B2B nécessite un système d'authentification qui gère :
1. **Authentification client** : Login/logout standard
2. **Contexte B2B** : Association client → entreprise → employé
3. **Multi-entreprise** : Un client peut appartenir à plusieurs entreprises
4. **Permissions** : Contrôle d'accès basé sur le rôle employé
5. **Sessions** : Web (cookies) et mobile (tokens)

## Décision

### Architecture d'Authentification

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Web/Mobile)                     │
├─────────────────────────────────────────────────────────────┤
│  1. Login (email/password)                                   │
│  2. Receive: accessToken + customer + companies[]            │
│  3. Select company → Set B2B context                         │
│  4. All subsequent requests include companyId + employeeId   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Layer                                │
├─────────────────────────────────────────────────────────────┤
│  - Validate accessToken                                      │
│  - Extract customerId from token                             │
│  - If B2B headers present:                                   │
│    - Validate employee belongs to company                    │
│    - Check permissions for action                            │
│    - Apply spending limits                                   │
└─────────────────────────────────────────────────────────────┘
```

### Flux de Login

```typescript
// 1. Authentification standard
const { customer, accessToken } = await api.auth.login(email, password);

// 2. Récupérer les entreprises associées
const companies = await api.b2b.companies.listForCustomer(customer.id);

// 3. Si une seule entreprise, sélection automatique
if (companies.length === 1) {
  await api.setB2BContext(companies[0].id);
}

// 4. Si plusieurs, afficher le sélecteur
if (companies.length > 1) {
  showCompanySelector(companies);
}
```

### Contexte B2B

Le contexte B2B est stocké et transmis avec chaque requête :

```typescript
interface B2BContext {
  companyId: string;
  employeeId: string;
  role: EmployeeRole;
  permissions: EmployeePermission[];
}

// Stockage
// Web: Cookie httpOnly + localStorage pour UI
// Mobile: SecureStore + AsyncStorage pour UI

// Headers HTTP
X-B2B-Company-Id: comp_123
X-B2B-Employee-Id: emp_456
```

### Gestion des Tokens

#### Web (Next.js)

```typescript
// NextAuth.js configuration
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const { customer, accessToken } = await medusaAuth(credentials);
        return { ...customer, accessToken };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.customerId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.customerId = token.customerId;
      return session;
    },
  },
};
```

#### Mobile (Expo)

```typescript
// Stockage sécurisé
import * as SecureStore from 'expo-secure-store';

async function storeTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync('accessToken', accessToken);
  await SecureStore.setItemAsync('refreshToken', refreshToken);
}

// Intercepteur API
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Sélection d'Entreprise

```typescript
// Hook useCompanySelector
function useCompanySelector() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const selectCompany = async (companyId: string) => {
    // Récupérer l'employé pour ce client dans cette entreprise
    const employee = await api.b2b.employees.getByCustomer(customerId, companyId);

    // Définir le contexte B2B
    await api.setB2BContext({
      companyId,
      employeeId: employee.id,
      role: employee.role,
      permissions: employee.permissions,
    });

    setSelectedCompany(companies.find(c => c.id === companyId));
  };

  return { companies, selectedCompany, selectCompany };
}
```

### Vérification des Permissions

```typescript
// Middleware côté API
async function checkB2BPermission(req, permission: EmployeePermission) {
  const { companyId, employeeId } = req.b2bContext;

  if (!companyId || !employeeId) {
    throw new UnauthorizedError('B2B context required');
  }

  const employee = await employeeService.get(employeeId);

  if (!employee.permissions.includes(permission)) {
    throw new ForbiddenError(`Permission '${permission}' required`);
  }
}

// Côté client (hook)
const { canPerform } = useCompany(api);

if (canPerform('create_quote')) {
  // Afficher bouton création devis
}
```

### Refresh Token

```typescript
// Intercepteur de refresh automatique
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;

      const refreshToken = await getRefreshToken();
      const { accessToken } = await api.auth.refresh(refreshToken);

      await storeAccessToken(accessToken);
      error.config.headers.Authorization = `Bearer ${accessToken}`;

      return api.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

## Conséquences

### Positives

- **Sécurité** : Tokens JWT avec refresh, stockage sécurisé sur mobile
- **Flexibilité** : Support multi-entreprise natif
- **UX fluide** : Contexte B2B persistant entre sessions
- **Permissions granulaires** : Contrôle fin des actions autorisées

### Négatives

- **Complexité** : Plus de logique que l'auth simple
- **Latence** : Vérification permissions à chaque requête

### Considérations de Sécurité

| Risque | Mitigation |
|--------|------------|
| Token vol | httpOnly cookies (web), SecureStore (mobile) |
| Session hijacking | Rotation des refresh tokens |
| Escalade de privilèges | Vérification backend des permissions |
| CSRF | Token CSRF + SameSite cookies |

## Alternatives Considérées

### 1. OAuth2 / OpenID Connect complet

**Rejeté** : Over-engineering pour notre cas, Medusa utilise son propre système

### 2. Session-based auth uniquement

**Rejeté** : Pas adapté au mobile et aux API stateless

### 3. Auth0 / Clerk externe

**Considéré pour le futur** : Possible migration si besoin de SSO entreprise

## Références

- [Medusa Authentication](https://docs.medusajs.com/v2/resources/storefront-development/customers/login)
- [NextAuth.js](https://next-auth.js.org/)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
