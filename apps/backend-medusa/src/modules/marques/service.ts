/**
 * Marques Module Service
 *
 * Service pour la gestion des marques (brands).
 * Herite de MedusaService pour les operations CRUD standard
 * et ajoute des methodes personnalisees pour la recherche et le filtrage.
 *
 * @packageDocumentation
 */

import { MedusaService } from "@medusajs/framework/utils";
import { Marque } from "./models/index";
import {
  validateRequired,
  validateStringLength,
  validateOptional,
  validateNonNegative,
} from "../validation-utils";

// ==========================================
// TYPE DEFINITIONS
// ==========================================

/**
 * Configuration des metadonnees pour une marque
 */
export interface MarqueMetadata {
  /** Liens vers les reseaux sociaux */
  social_links?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  /** Certifications qualite */
  certifications?: string[];
  /** Annee de creation */
  year_founded?: number;
  /** Contact commercial */
  contact_email?: string;
  /** Donnees additionnelles */
  [key: string]: unknown;
}

/**
 * Input pour creer une marque
 */
export interface CreateMarqueInput {
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  logo_file_key?: string;
  website_url?: string;
  country?: string;
  is_active?: boolean;
  is_favorite?: boolean;
  rank?: number;
  metadata?: MarqueMetadata;
}

/**
 * Input pour mettre a jour une marque
 */
export interface UpdateMarqueInput {
  name?: string;
  slug?: string;
  description?: string | null;
  logo_url?: string | null;
  logo_file_key?: string | null;
  website_url?: string | null;
  country?: string | null;
  is_active?: boolean;
  is_favorite?: boolean;
  rank?: number;
  metadata?: MarqueMetadata | null;
}

/**
 * Filtres pour lister les marques
 */
export interface ListMarquesFilters {
  is_active?: boolean;
  is_favorite?: boolean;
  country?: string;
  rank?: number;
}

/**
 * Options de pagination
 */
export interface PaginationOptions {
  skip?: number;
  take?: number;
}

/**
 * Type representant une marque retournee par les methodes du service
 */
export interface MarqueDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  logo_file_key: string | null;
  website_url: string | null;
  country: string | null;
  is_active: boolean;
  is_favorite: boolean;
  rank: number;
  metadata: MarqueMetadata | null;
  created_at: Date;
  updated_at: Date;
}

// ==========================================
// VALIDATION HELPERS
// ==========================================

/**
 * Valide qu'un slug est bien forme
 * (minuscules, chiffres, tirets uniquement)
 *
 * @param slug - Le slug a valider
 * @param fieldName - Le nom du champ pour les messages d'erreur
 * @throws Error si le format est invalide
 */
function validateSlug(slug: string, fieldName: string): void {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(slug)) {
    throw new Error(
      `${fieldName} doit contenir uniquement des lettres minuscules, chiffres et tirets (ex: "ma-marque-123")`
    );
  }
}

/**
 * Valide qu'une URL est bien formee
 *
 * @param url - L'URL a valider
 * @param fieldName - Le nom du champ pour les messages d'erreur
 * @throws Error si l'URL est invalide
 */
function validateUrl(url: string, fieldName: string): void {
  // Accepte les URLs relatives (/page) et absolues (https://...)
  if (
    !url.startsWith("/") &&
    !url.startsWith("http://") &&
    !url.startsWith("https://")
  ) {
    throw new Error(
      `${fieldName} doit etre une URL relative (commencant par /) ou absolue (commencant par http:// ou https://)`
    );
  }
}

/**
 * Genere un slug a partir d'un nom
 *
 * @param name - Le nom a convertir en slug
 * @returns Le slug genere
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/[^a-z0-9]+/g, "-") // Remplace les caracteres speciaux par des tirets
    .replace(/^-+|-+$/g, "") // Supprime les tirets au debut/fin
    .replace(/-+/g, "-"); // Remplace les tirets multiples par un seul
}

// ==========================================
// MARQUES MODULE SERVICE
// ==========================================

/**
 * Marques Module Service
 *
 * Fournit la logique metier pour la gestion des marques.
 * Etend MedusaService pour obtenir automatiquement les operations CRUD.
 *
 * Methodes generees par MedusaService pour Marque:
 * - listMarques(filters?, config?) - liste des marques
 * - listAndCountMarques(filters?, config?) - liste avec comptage
 * - retrieveMarque(id, config?) - recuperer une marque
 * - createMarques(data) - creer des marques
 * - updateMarques(data) - mettre a jour des marques
 * - deleteMarques(ids) - supprimer des marques
 * - softDeleteMarques(ids) - suppression douce
 * - restoreMarques(ids) - restaurer des marques supprimees
 *
 * @example
 * ```typescript
 * // Recuperer les marques actives
 * const activeMarques = await marquesService.findActive();
 *
 * // Rechercher par slug
 * const marque = await marquesService.findBySlug("swarovski");
 *
 * // Recherche textuelle
 * const results = await marquesService.search("crystal");
 * ```
 */
class MarquesModuleService extends MedusaService({
  Marque,
}) {
  // ==========================================
  // CUSTOM QUERY METHODS
  // ==========================================

  /**
   * Recherche une marque par son slug.
   *
   * @param slug - Le slug de la marque
   * @returns La marque trouvee ou null
   */
  async findBySlug(slug: string): Promise<MarqueDTO | null> {
    const marques = await this.listMarques(
      { slug },
      { take: 1 }
    );

    if (marques.length === 0) {
      return null;
    }

    return marques[0] as MarqueDTO;
  }

  /**
   * Recupere toutes les marques actives.
   * Les resultats sont tries par rang (DESC) puis par nom (ASC).
   *
   * @returns Liste des marques actives
   */
  async findActive(): Promise<MarqueDTO[]> {
    const marques = await this.listMarques(
      { is_active: true },
      { order: { rank: "DESC", name: "ASC" } }
    );

    return marques as MarqueDTO[];
  }

  /**
   * Recherche textuelle dans les marques.
   * Recherche dans le nom et la description.
   *
   * @param query - Le terme de recherche
   * @param options - Options de pagination
   * @returns Liste des marques correspondantes
   */
  async search(
    query: string,
    options?: PaginationOptions
  ): Promise<MarqueDTO[]> {
    // Utilise la recherche Medusa sur les champs searchable
    // Le champ 'name' est marque comme searchable dans le modele
    const marques = await this.listMarques(
      {
        // Medusa v2 utilise $like ou $ilike pour la recherche
        // On filtre manuellement pour plus de flexibilite
      },
      {
        skip: options?.skip ?? 0,
        take: options?.take ?? 20,
        order: { rank: "DESC", name: "ASC" },
      }
    );

    // Filtre cote serveur pour la recherche textuelle
    const queryLower = query.toLowerCase().trim();
    const filtered = marques.filter((marque) => {
      const nameMatch = (marque.name as string)
        .toLowerCase()
        .includes(queryLower);
      const descMatch = marque.description
        ? (marque.description as string).toLowerCase().includes(queryLower)
        : false;
      const countryMatch = marque.country
        ? (marque.country as string).toLowerCase().includes(queryLower)
        : false;

      return nameMatch || descMatch || countryMatch;
    });

    return filtered as MarqueDTO[];
  }

  /**
   * Recherche les marques par pays d'origine.
   *
   * @param country - Le pays d'origine
   * @returns Liste des marques du pays
   */
  async findByCountry(country: string): Promise<MarqueDTO[]> {
    const marques = await this.listMarques(
      { country, is_active: true },
      { order: { rank: "DESC", name: "ASC" } }
    );

    return marques as MarqueDTO[];
  }

  // ==========================================
  // CUSTOM CRUD METHODS WITH VALIDATION
  // ==========================================

  /**
   * Cree une marque avec validation complete des donnees.
   *
   * @param data - Donnees pour creer la marque
   * @returns La marque creee
   * @throws Error si les donnees sont invalides ou si le nom/slug existe deja
   */
  async createMarqueWithValidation(
    data: CreateMarqueInput
  ): Promise<MarqueDTO> {
    // Validation du nom (requis)
    validateRequired(data.name, "name");
    validateStringLength(data.name, "name", 1, 200);

    // Validation du slug (requis)
    validateRequired(data.slug, "slug");
    validateSlug(data.slug, "slug");
    validateStringLength(data.slug, "slug", 1, 200);

    // Verifier l'unicite du nom
    const existingByName = await this.listMarques({ name: data.name }, { take: 1 });
    if (existingByName.length > 0) {
      throw new Error(`Une marque avec le nom "${data.name}" existe deja`);
    }

    // Verifier l'unicite du slug
    const existingBySlug = await this.findBySlug(data.slug);
    if (existingBySlug) {
      throw new Error(`Une marque avec le slug "${data.slug}" existe deja`);
    }

    // Validation de la description si fournie
    validateOptional(data.description, (desc) => {
      validateStringLength(desc, "description", 1, 2000);
    });

    // Validation des URLs si fournies
    validateOptional(data.logo_url, (url) => {
      validateUrl(url, "logo_url");
    });

    validateOptional(data.website_url, (url) => {
      validateUrl(url, "website_url");
    });

    // Validation du pays si fourni
    validateOptional(data.country, (country) => {
      validateStringLength(country, "country", 1, 100);
    });

    // Validation du rang si fourni
    if (data.rank !== undefined) {
      validateNonNegative(data.rank, "rank");
    }

    // Preparer les donnees pour la creation
    const marqueData = {
      name: data.name.trim(),
      slug: data.slug.trim().toLowerCase(),
      description: data.description?.trim() ?? null,
      logo_url: data.logo_url?.trim() ?? null,
      website_url: data.website_url?.trim() ?? null,
      country: data.country?.trim() ?? null,
      is_active: data.is_active ?? true,
      is_favorite: data.is_favorite ?? false,
      rank: data.rank ?? 0,
      metadata: data.metadata ?? null,
    };

    const marque = await this.createMarques(marqueData);
    return marque as MarqueDTO;
  }

  /**
   * Met a jour une marque avec validation.
   *
   * @param id - Identifiant de la marque a mettre a jour
   * @param data - Donnees de mise a jour
   * @returns La marque mise a jour
   * @throws Error si les donnees sont invalides ou si la marque n'existe pas
   */
  async updateMarqueWithValidation(
    id: string,
    data: UpdateMarqueInput
  ): Promise<MarqueDTO> {
    // Verifier que la marque existe
    const existing = await this.retrieveMarque(id);

    // Validation du nom si fourni
    if (data.name !== undefined) {
      validateRequired(data.name, "name");
      validateStringLength(data.name, "name", 1, 200);

      // Verifier l'unicite si le nom change
      if (data.name !== existing.name) {
        const existingByName = await this.listMarques({ name: data.name }, { take: 1 });
        if (existingByName.length > 0) {
          throw new Error(`Une marque avec le nom "${data.name}" existe deja`);
        }
      }
    }

    // Validation du slug si fourni
    if (data.slug !== undefined) {
      validateRequired(data.slug, "slug");
      validateSlug(data.slug, "slug");
      validateStringLength(data.slug, "slug", 1, 200);

      // Verifier l'unicite si le slug change
      if (data.slug !== existing.slug) {
        const existingBySlug = await this.findBySlug(data.slug);
        if (existingBySlug) {
          throw new Error(`Une marque avec le slug "${data.slug}" existe deja`);
        }
      }
    }

    // Validation de la description si fournie
    if (data.description !== undefined && data.description !== null) {
      validateStringLength(data.description, "description", 1, 2000);
    }

    // Validation des URLs si fournies
    if (data.logo_url !== undefined && data.logo_url !== null) {
      validateUrl(data.logo_url, "logo_url");
    }

    if (data.website_url !== undefined && data.website_url !== null) {
      validateUrl(data.website_url, "website_url");
    }

    // Validation du pays si fourni
    if (data.country !== undefined && data.country !== null) {
      validateStringLength(data.country, "country", 1, 100);
    }

    // Validation du rang si fourni
    if (data.rank !== undefined) {
      validateNonNegative(data.rank, "rank");
    }

    // Construire l'objet de mise a jour
    const updateData: Record<string, unknown> = { id };

    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }
    if (data.slug !== undefined) {
      updateData.slug = data.slug.trim().toLowerCase();
    }
    if (data.description !== undefined) {
      updateData.description = data.description?.trim() ?? null;
    }
    if (data.logo_url !== undefined) {
      updateData.logo_url = data.logo_url?.trim() ?? null;
    }
    if (data.website_url !== undefined) {
      updateData.website_url = data.website_url?.trim() ?? null;
    }
    if (data.country !== undefined) {
      updateData.country = data.country?.trim() ?? null;
    }
    if (data.is_active !== undefined) {
      updateData.is_active = data.is_active;
    }
    if (data.is_favorite !== undefined) {
      updateData.is_favorite = data.is_favorite;
    }
    if (data.rank !== undefined) {
      updateData.rank = data.rank;
    }
    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata;
    }

    const updated = await this.updateMarques(updateData);
    return updated as MarqueDTO;
  }

  /**
   * Active ou desactive une marque.
   *
   * @param id - Identifiant de la marque
   * @param isActive - Nouvel etat d'activation
   * @returns La marque mise a jour
   */
  async toggleMarqueStatus(
    id: string,
    isActive: boolean
  ): Promise<MarqueDTO> {
    // Verifier que la marque existe
    await this.retrieveMarque(id);

    const updated = await this.updateMarques({
      id,
      is_active: isActive,
    });

    return updated as MarqueDTO;
  }

  /**
   * Met a jour une marque (methode simple sans validation complete).
   * Utiliser cette methode pour des mises a jour simples comme is_favorite, is_active.
   * Pour des mises a jour avec validation complete, utiliser updateMarqueWithValidation.
   *
   * @param id - Identifiant de la marque a mettre a jour
   * @param data - Donnees de mise a jour
   * @returns La marque mise a jour
   * @throws Error si la marque n'existe pas
   */
  async updateMarque(
    id: string,
    data: UpdateMarqueInput
  ): Promise<MarqueDTO> {
    // Verifier que la marque existe
    await this.retrieveMarque(id);

    // Construire l'objet de mise a jour
    const updateData: Record<string, unknown> = { id };

    if (data.name !== undefined) {
      updateData.name = typeof data.name === "string" ? data.name.trim() : data.name;
    }
    if (data.slug !== undefined) {
      updateData.slug = typeof data.slug === "string" ? data.slug.trim().toLowerCase() : data.slug;
    }
    if (data.description !== undefined) {
      updateData.description = typeof data.description === "string" ? data.description.trim() : data.description;
    }
    if (data.logo_url !== undefined) {
      updateData.logo_url = typeof data.logo_url === "string" ? data.logo_url.trim() : data.logo_url;
    }
    if (data.logo_file_key !== undefined) {
      updateData.logo_file_key = typeof data.logo_file_key === "string" ? data.logo_file_key.trim() : data.logo_file_key;
    }
    if (data.website_url !== undefined) {
      updateData.website_url = typeof data.website_url === "string" ? data.website_url.trim() : data.website_url;
    }
    if (data.country !== undefined) {
      updateData.country = typeof data.country === "string" ? data.country.trim() : data.country;
    }
    if (data.is_active !== undefined) {
      updateData.is_active = data.is_active;
    }
    if (data.is_favorite !== undefined) {
      updateData.is_favorite = data.is_favorite;
    }
    if (data.rank !== undefined) {
      updateData.rank = data.rank;
    }
    if (data.metadata !== undefined) {
      updateData.metadata = data.metadata;
    }

    const updated = await this.updateMarques(updateData);
    return updated as MarqueDTO;
  }

  /**
   * Met a jour le rang d'une marque.
   *
   * @param id - Identifiant de la marque
   * @param rank - Nouveau rang
   * @returns La marque mise a jour
   */
  async updateMarqueRank(id: string, rank: number): Promise<MarqueDTO> {
    validateNonNegative(rank, "rank");

    // Verifier que la marque existe
    await this.retrieveMarque(id);

    const updated = await this.updateMarques({
      id,
      rank,
    });

    return updated as MarqueDTO;
  }

  /**
   * Liste les marques avec pagination et comptage.
   * Les marques sont triees par rank ASC (0 en premier) puis par nom.
   *
   * @param filters - Filtres optionnels
   * @param pagination - Options de pagination
   * @returns Liste des marques et comptage total
   */
  async listMarquesWithCount(
    filters?: ListMarquesFilters,
    pagination?: PaginationOptions
  ): Promise<{ marques: MarqueDTO[]; count: number }> {
    const queryFilters: Record<string, unknown> = {};

    if (filters?.is_active !== undefined) {
      queryFilters.is_active = filters.is_active;
    }
    if (filters?.is_favorite !== undefined) {
      queryFilters.is_favorite = filters.is_favorite;
    }
    if (filters?.country !== undefined) {
      queryFilters.country = filters.country;
    }

    const config = {
      skip: pagination?.skip ?? 0,
      take: pagination?.take ?? 20,
      order: { rank: "ASC" as const, name: "ASC" as const },
    };

    const [marques, allMarques] = await Promise.all([
      this.listMarques(queryFilters, config),
      this.listMarques(queryFilters, { select: ["id"] }),
    ]);

    return {
      marques: marques as MarqueDTO[],
      count: allMarques.length,
    };
  }

  /**
   * Reordonne les marques selon l'ordre specifie.
   * Le premier ID dans le tableau aura le rank 0, etc.
   *
   * @param marqueIds - Tableau des IDs dans l'ordre souhaite
   * @returns Les marques mises a jour dans le nouvel ordre
   */
  async reorderMarques(marqueIds: string[]): Promise<MarqueDTO[]> {
    const results: MarqueDTO[] = [];

    for (let index = 0; index < marqueIds.length; index++) {
      const id = marqueIds[index];
      const updated = await this.updateMarques({
        id,
        rank: index,
      });
      results.push(updated as MarqueDTO);
    }

    return results;
  }

  /**
   * Duplique une marque existante.
   * Utile pour creer des variantes ou importer des marques similaires.
   *
   * @param id - Identifiant de la marque a dupliquer
   * @param overrides - Champs a modifier dans la copie (name et slug requis)
   * @returns La nouvelle marque creee
   */
  async duplicateMarque(
    id: string,
    overrides: { name: string; slug: string } & Partial<CreateMarqueInput>
  ): Promise<MarqueDTO> {
    const original = await this.retrieveMarque(id);

    const duplicateData: CreateMarqueInput = {
      name: overrides.name,
      slug: overrides.slug,
      description: overrides.description ?? (original.description as string | undefined),
      logo_url: overrides.logo_url ?? (original.logo_url as string | undefined),
      website_url: overrides.website_url ?? (original.website_url as string | undefined),
      country: overrides.country ?? (original.country as string | undefined),
      is_active: overrides.is_active ?? false, // Desactive par defaut
      is_favorite: overrides.is_favorite ?? false, // Non favori par defaut
      rank: overrides.rank ?? 0, // Rang zero par defaut
      metadata: overrides.metadata ?? (original.metadata as MarqueMetadata | undefined),
    };

    return await this.createMarqueWithValidation(duplicateData);
  }

  /**
   * Genere un slug unique a partir d'un nom.
   * Ajoute un suffixe numerique si le slug existe deja.
   *
   * @param name - Le nom a convertir en slug
   * @returns Un slug unique
   */
  async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    while (await this.findBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}

export default MarquesModuleService;
