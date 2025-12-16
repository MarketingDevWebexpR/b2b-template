import { Container, Heading, Text, Badge, Table } from "@medusajs/ui"
import { ArrowLeft } from "@medusajs/icons"
import { Link } from "react-router-dom"

interface ApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE"
  path: string
  description: string
  auth: "Admin" | "Store"
}

const endpoints: ApiEndpoint[] = [
  // Admin endpoints
  {
    method: "GET",
    path: "/admin/b2b/companies",
    description: "Liste toutes les entreprises avec filtres (status, tier, search) et pagination (limit, offset)",
    auth: "Admin",
  },
  {
    method: "POST",
    path: "/admin/b2b/companies",
    description: "Crée une nouvelle entreprise B2B. Champs requis: name, email. Optionnels: phone, taxId, tier, creditLimit, paymentTerms",
    auth: "Admin",
  },
  {
    method: "GET",
    path: "/admin/b2b/companies/:id",
    description: "Récupère les détails d'une entreprise par son ID",
    auth: "Admin",
  },
  {
    method: "PUT",
    path: "/admin/b2b/companies/:id",
    description: "Met à jour une entreprise. Peut modifier: name, email, phone, status, tier, creditLimit, paymentTerms, settings",
    auth: "Admin",
  },
  {
    method: "DELETE",
    path: "/admin/b2b/companies/:id",
    description: "Suppression douce - change le statut en 'closed'. L'entreprise reste en base de données",
    auth: "Admin",
  },
]

const methodColors: Record<string, "green" | "blue" | "orange" | "red"> = {
  GET: "green",
  POST: "blue",
  PUT: "orange",
  DELETE: "red",
}

const CompanyDocsPage = () => {
  return (
    <Container className="divide-y p-0">
      {/* Header */}
      <div className="px-6 py-4">
        <Link
          to="/b2b-companies"
          className="mb-4 flex items-center gap-2 text-ui-fg-subtle hover:text-ui-fg-base"
        >
          <ArrowLeft className="h-4 w-4" />
          <Text size="small">Retour aux entreprises</Text>
        </Link>

        <Heading level="h1">Documentation API</Heading>
        <Text className="text-ui-fg-subtle mt-1">
          Référence des endpoints disponibles pour la gestion des entreprises B2B
        </Text>
      </div>

      {/* Base URL */}
      <div className="px-6 py-4">
        <Text className="text-ui-fg-subtle text-sm mb-2">URL de base</Text>
        <code className="bg-ui-bg-field px-3 py-2 rounded-md text-sm font-mono block">
          {window.location.origin}
        </code>
      </div>

      {/* Endpoints Table */}
      <div className="px-6 py-4">
        <Heading level="h2" className="mb-4">Endpoints</Heading>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell className="w-24">Méthode</Table.HeaderCell>
              <Table.HeaderCell className="w-80">Endpoint</Table.HeaderCell>
              <Table.HeaderCell>Description</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {endpoints.map((endpoint, index) => (
              <Table.Row key={index}>
                <Table.Cell>
                  <Badge color={methodColors[endpoint.method]}>
                    {endpoint.method}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <code className="text-sm font-mono bg-ui-bg-field px-2 py-1 rounded">
                    {endpoint.path}
                  </code>
                </Table.Cell>
                <Table.Cell>
                  <Text className="text-ui-fg-subtle text-sm">
                    {endpoint.description}
                  </Text>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      {/* Data Models */}
      <div className="px-6 py-4">
        <Heading level="h2" className="mb-4">Modele Company</Heading>
        <div className="bg-ui-bg-field rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <pre>{`{
  "id": "string (UUID)",
  "name": "string",
  "slug": "string (auto-genere)",
  "email": "string",
  "phone": "string | null",
  "tax_id": "string | null (N. TVA ou SIRET)",
  "status": "pending | active | suspended | inactive | closed",
  "tier": "standard | premium | enterprise | vip",  // Profil client (voir section Profils clients)
  "credit_limit": "number (centimes)",
  "payment_terms": {
    "type": "prepaid | net_15 | net_30 | net_45 | net_60 | net_90 | due_on_receipt",
    "days": "number"
  },
  "settings": "object | null",
  "created_at": "string (ISO date)",
  "updated_at": "string (ISO date)"
}`}</pre>
        </div>
      </div>

      {/* Customer Profiles */}
      <div className="px-6 py-4">
        <Heading level="h2" className="mb-4">Profils clients types</Heading>
        <Text className="text-ui-fg-subtle mb-4">
          Le champ "tier" definit le profil commercial du client. Chaque profil correspond a un type de relation commerciale:
        </Text>
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-ui-border-base rounded-lg p-4">
            <Badge color="grey" className="mb-2">standard</Badge>
            <Text className="font-medium mb-1">Detaillant</Text>
            <Text className="text-sm text-ui-fg-subtle">
              Client final ou petit commerce. Commandes en petites quantites.
            </Text>
          </div>
          <div className="border border-ui-border-base rounded-lg p-4">
            <Badge color="blue" className="mb-2">premium</Badge>
            <Text className="font-medium mb-1">Grossiste</Text>
            <Text className="text-sm text-ui-fg-subtle">
              Revendeur professionnel. Commandes en quantites moyennes a importantes.
            </Text>
          </div>
          <div className="border border-ui-border-base rounded-lg p-4">
            <Badge color="orange" className="mb-2">enterprise</Badge>
            <Text className="font-medium mb-1">Distributeur</Text>
            <Text className="text-sm text-ui-fg-subtle">
              Partenaire de distribution. Grandes quantites et conditions speciales.
            </Text>
          </div>
          <div className="border border-ui-border-base rounded-lg p-4">
            <Badge color="purple" className="mb-2">vip</Badge>
            <Text className="font-medium mb-1">Partenaire strategique</Text>
            <Text className="text-sm text-ui-fg-subtle">
              Partenariat exclusif. Conditions negociees et accompagnement personnalise.
            </Text>
          </div>
        </div>
      </div>

      {/* Examples */}
      <div className="px-6 py-4">
        <Heading level="h2" className="mb-4">Exemples</Heading>

        <div className="space-y-4">
          <div>
            <Text className="font-medium mb-2">Creer un grossiste</Text>
            <div className="bg-ui-bg-field rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>{`POST /admin/b2b/companies
Content-Type: application/json

{
  "name": "Bijouterie Paris",
  "email": "contact@bijouterie-paris.fr",
  "phone": "+33 1 23 45 67 89",
  "taxId": "FR12345678901",
  "tier": "premium",  // Grossiste
  "creditLimit": 1000000,
  "paymentTerms": {
    "type": "net_30",
    "days": 30
  }
}`}</pre>
            </div>
          </div>
          <div>
            <Text className="font-medium mb-2">Creer un partenaire strategique</Text>
            <div className="bg-ui-bg-field rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre>{`POST /admin/b2b/companies
Content-Type: application/json

{
  "name": "Distribution Luxe International",
  "email": "contact@dli.com",
  "phone": "+33 1 99 88 77 66",
  "taxId": "FR98765432100",
  "tier": "vip",  // Partenaire strategique
  "creditLimit": 5000000,
  "paymentTerms": {
    "type": "net_60",
    "days": 60
  }
}`}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Status Transitions */}
      <div className="px-6 py-4">
        <Heading level="h2" className="mb-4">Transitions de statut</Heading>
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-ui-border-base rounded-lg p-4">
            <Badge color="orange" className="mb-2">pending</Badge>
            <Text className="text-sm text-ui-fg-subtle">
              Entreprise en attente de validation. Ne peut pas passer de commandes.
            </Text>
          </div>
          <div className="border border-ui-border-base rounded-lg p-4">
            <Badge color="green" className="mb-2">active</Badge>
            <Text className="text-sm text-ui-fg-subtle">
              Entreprise validée. Peut passer des commandes selon sa limite de crédit.
            </Text>
          </div>
          <div className="border border-ui-border-base rounded-lg p-4">
            <Badge color="red" className="mb-2">suspended</Badge>
            <Text className="text-sm text-ui-fg-subtle">
              Entreprise suspendue (ex: impayé). Accès limité.
            </Text>
          </div>
          <div className="border border-ui-border-base rounded-lg p-4">
            <Badge color="grey" className="mb-2">closed</Badge>
            <Text className="text-sm text-ui-fg-subtle">
              Entreprise fermée. Statut final après suppression.
            </Text>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default CompanyDocsPage
