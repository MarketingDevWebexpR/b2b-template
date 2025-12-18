/**
 * Composant d'upload d'image avec drag & drop
 *
 * Permet de telecharger une image par glisser-deposer ou en cliquant.
 * Affiche une progression d'upload et une preview de l'image.
 */

import { useState, useRef, useCallback } from "react"
import { Text, Button } from "@medusajs/ui"
import { Photo, Trash, ArrowPath, XCircle } from "@medusajs/icons"

interface ImageUploadProps {
  /** URL actuelle de l'image */
  value: string
  /** Callback quand l'image change */
  onChange: (url: string) => void
  /** URL de l'endpoint d'upload */
  uploadUrl: string
  /** Types MIME acceptes */
  accept?: string
  /** Label du composant */
  label?: string
  /** Message d'aide */
  helpText?: string
  /** Si le champ est en erreur */
  error?: string
  /** Desactiver le composant */
  disabled?: boolean
}

/**
 * Zone de drop avec preview pour l'upload d'images
 */
export function ImageUpload({
  value,
  onChange,
  uploadUrl,
  accept = "image/jpeg,image/png,image/webp",
  label = "Image",
  helpText,
  error,
  disabled = false,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * Gere le drag over
   */
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled && !isUploading) {
        setIsDragging(true)
      }
    },
    [disabled, isUploading]
  )

  /**
   * Gere le drag leave
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  /**
   * Gere le drop
   */
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (disabled || isUploading) return

      const files = e.dataTransfer.files
      if (files.length > 0) {
        await uploadFile(files[0])
      }
    },
    [disabled, isUploading]
  )

  /**
   * Gere la selection de fichier
   */
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        await uploadFile(files[0])
      }
      // Reset l'input pour permettre de re-selectionner le meme fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    []
  )

  /**
   * Upload le fichier vers le serveur
   */
  const uploadFile = async (file: File) => {
    // Valider le type de fichier
    const allowedTypes = accept.split(",").map((t) => t.trim())
    if (!allowedTypes.includes(file.type)) {
      setUploadError(`Type de fichier non supporte. Acceptes: ${allowedTypes.join(", ")}`)
      return
    }

    // Valider la taille (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadError("Le fichier est trop volumineux (max 10MB)")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      // Simuler la progression (les fetch ne supportent pas nativement la progression)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      const response = await fetch(uploadUrl, {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Echec de l'upload")
      }

      const data = await response.json()

      // Chercher l'URL dans differents formats de reponse possibles
      const imageUrl =
        data.url ||
        data.image_url ||
        data.file?.url ||
        data.slide?.image_url
      if (imageUrl) {
        onChange(imageUrl)
      } else {
        throw new Error("URL de l'image non recue")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'upload"
      setUploadError(message)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  /**
   * Ouvre le selecteur de fichiers
   */
  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click()
    }
  }

  /**
   * Supprime l'image actuelle
   */
  const handleRemove = () => {
    onChange("")
    setUploadError(null)
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-ui-fg-base text-sm font-medium">
          {label}
        </label>
      )}

      {/* Zone de drop ou preview */}
      {value ? (
        // Mode preview avec image uploadee
        <div className="relative group rounded-lg border border-ui-border-base overflow-hidden bg-ui-bg-subtle">
          <div className="aspect-video relative">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {/* Overlay avec actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="small"
                onClick={handleClick}
                disabled={disabled || isUploading}
                className="bg-white/90 hover:bg-white"
              >
                <ArrowPath className="h-4 w-4" />
                Remplacer
              </Button>
              <Button
                variant="secondary"
                size="small"
                onClick={handleRemove}
                disabled={disabled || isUploading}
                className="bg-white/90 hover:bg-white text-ui-tag-red-text"
              >
                <Trash className="h-4 w-4" />
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Mode upload avec zone de drop
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            relative rounded-lg border-2 border-dashed transition-colors cursor-pointer
            ${isDragging
              ? "border-ui-border-interactive bg-ui-bg-interactive-hover"
              : "border-ui-border-base hover:border-ui-border-strong bg-ui-bg-subtle hover:bg-ui-bg-base"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${error || uploadError ? "border-ui-tag-red-border" : ""}
          `}
        >
          <div className="flex flex-col items-center justify-center py-12 px-4">
            {isUploading ? (
              // Etat d'upload en cours
              <>
                <ArrowPath className="h-8 w-8 text-ui-fg-muted animate-spin mb-3" />
                <Text className="text-ui-fg-subtle text-sm mb-2">
                  Upload en cours...
                </Text>
                {/* Barre de progression */}
                <div className="w-48 h-2 bg-ui-bg-base rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ui-tag-green-bg transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <Text className="text-ui-fg-muted text-xs mt-1">
                  {uploadProgress}%
                </Text>
              </>
            ) : (
              // Etat par defaut
              <>
                <Photo className="h-10 w-10 text-ui-fg-muted mb-3" />
                <Text className="text-ui-fg-base font-medium text-sm mb-1">
                  Glissez-deposez une image ici
                </Text>
                <Text className="text-ui-fg-subtle text-xs">
                  ou cliquez pour parcourir
                </Text>
                <Text className="text-ui-fg-muted text-xs mt-2">
                  JPG, PNG ou WebP (max 10MB)
                </Text>
              </>
            )}
          </div>
        </div>
      )}

      {/* Input file cache */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Message d'aide */}
      {helpText && !error && !uploadError && (
        <Text className="text-ui-fg-subtle text-sm">{helpText}</Text>
      )}

      {/* Erreur */}
      {(error || uploadError) && (
        <div className="flex items-center gap-1 text-ui-tag-red-text">
          <XCircle className="h-4 w-4" />
          <Text className="text-sm">{error || uploadError}</Text>
        </div>
      )}
    </div>
  )
}

export default ImageUpload
