import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Check, Image } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Badge'
import { useUploadAsset } from '@/hooks/useAdmin'
import { useAllCategories } from '@/hooks/useAssets'
import { formatFileSize } from '@/utils/formatters'

interface PendingFile {
  file: File
  preview: string
  name: string
  gender: 'male' | 'female' | 'unisex'
  categoryId: string
  uploading: boolean
  done: boolean
  error?: string
}

export function AssetUploader() {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const { data: categories = [] } = useAllCategories()
  const { mutateAsync: uploadAsset } = useUploadAsset()

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles: PendingFile[] = accepted.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      gender: 'unisex',
      categoryId: categories[0]?.id ?? '',
      uploading: false,
      done: false,
    }))
    setPendingFiles((prev) => [...prev, ...newFiles])
  }, [categories])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/png': ['.png'] },
    multiple: true,
    maxSize: 5 * 1024 * 1024, // 5MB
  })

  function updateFile(index: number, updates: Partial<PendingFile>) {
    setPendingFiles((prev) => prev.map((f, i) => i === index ? { ...f, ...updates } : f))
  }

  function removeFile(index: number) {
    setPendingFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function uploadAll() {
    for (let i = 0; i < pendingFiles.length; i++) {
      const pf = pendingFiles[i]
      if (pf.done) continue
      if (!pf.categoryId) {
        updateFile(i, { error: 'Select a category' })
        continue
      }

      updateFile(i, { uploading: true, error: undefined })
      try {
        const cat = categories.find((c) => c.id === pf.categoryId)
        await uploadAsset({
          file: pf.file,
          category_id: pf.categoryId,
          categorySlug: cat?.slug ?? 'accessories',
          name: pf.name || pf.file.name,
          gender: pf.gender,
        })
        updateFile(i, { uploading: false, done: true })
      } catch (err: any) {
        updateFile(i, { uploading: false, error: err.message })
      }
    }
  }

  const hasUploaded = pendingFiles.some((f) => f.done)
  const allDone = pendingFiles.length > 0 && pendingFiles.every((f) => f.done)

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all
          ${isDragActive
            ? 'border-[#B07FFF] bg-[#F0E6FF] scale-[1.02]'
            : 'border-[#E8D9FF] hover:border-[#B07FFF] hover:bg-[#F8F0FF] bg-white'
          }
        `}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E8D9FF] to-[#FFD6E8] flex items-center justify-center">
            <Upload size={24} className="text-[#B07FFF]" />
          </div>
          <div>
            <p className="font-fredoka font-semibold text-[#3D2B4F]">
              {isDragActive ? 'Drop your PNGs here! 🎀' : 'Drag & drop PNG/SVG files here'}
            </p>
            <p className="text-xs text-[#B8A0C8] font-nunito mt-1">
              Or click to browse • Max 5MB each • 500×500px recommended
            </p>
          </div>
        </motion.div>
      </div>

      {/* File list */}
      <AnimatePresence>
        {pendingFiles.map((pf, i) => (
          <motion.div
            key={pf.preview}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            className={`
              bg-white rounded-2xl border p-4 flex flex-col sm:flex-row gap-4
              ${pf.done ? 'border-green-200' : pf.error ? 'border-red-200' : 'border-[#F0E6FF]'}
            `}
          >
            {/* Preview */}
            <div className="flex-shrink-0 flex justify-center">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F8F0FF] border border-[#F0E6FF] flex items-center justify-center">
                <img src={pf.preview} alt="Preview" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Fields */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Asset Name"
                value={pf.name}
                onChange={(e) => updateFile(i, { name: e.target.value })}
                placeholder="e.g. Long Wavy Hair"
                disabled={pf.done || pf.uploading}
              />

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="font-nunito font-semibold text-sm text-[#3D2B4F]">Category</label>
                <select
                  value={pf.categoryId}
                  onChange={(e) => updateFile(i, { categoryId: e.target.value })}
                  disabled={pf.done || pf.uploading}
                  className="w-full bg-white border-2 border-[#F0E6FF] rounded-2xl px-3 py-3 font-nunito text-[#3D2B4F] text-sm outline-none focus:border-[#B07FFF] transition-colors"
                >
                  <option value="">Select category…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div className="flex flex-col gap-1.5">
                <label className="font-nunito font-semibold text-sm text-[#3D2B4F]">Gender Tag</label>
                <select
                  value={pf.gender}
                  onChange={(e) => updateFile(i, { gender: e.target.value as any })}
                  disabled={pf.done || pf.uploading}
                  className="w-full bg-white border-2 border-[#F0E6FF] rounded-2xl px-3 py-3 font-nunito text-[#3D2B4F] text-sm outline-none focus:border-[#B07FFF] transition-colors"
                >
                  <option value="unisex">Unisex</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
            </div>

            {/* Status / Actions */}
            <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-2 flex-shrink-0">
              <p className="text-[10px] text-[#B8A0C8] font-nunito text-center">
                {formatFileSize(pf.file.size)}
              </p>

              {pf.done ? (
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Check size={16} className="text-green-600" />
                </div>
              ) : pf.uploading ? (
                <div className="w-6 h-6 border-2 border-[#B07FFF] border-t-transparent rounded-full animate-spin" />
              ) : (
                <button
                  onClick={() => removeFile(i)}
                  className="w-8 h-8 rounded-full bg-[#FFD6E8] hover:bg-red-100 flex items-center justify-center text-[#FF85A1] hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              )}

              {pf.error && (
                <p className="text-[10px] text-red-500 text-center font-nunito">{pf.error}</p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Upload button */}
      {pendingFiles.length > 0 && !allDone && (
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPendingFiles([])}
          >
            Clear All
          </Button>
          <Button
            variant="admin"
            size="sm"
            onClick={uploadAll}
            isLoading={pendingFiles.some((f) => f.uploading)}
            leftIcon={<Upload size={16} />}
          >
            Upload {pendingFiles.filter((f) => !f.done).length} Asset{pendingFiles.filter((f) => !f.done).length !== 1 ? 's' : ''}
          </Button>
        </div>
      )}

      {allDone && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-green-50 rounded-2xl px-4 py-3 border border-green-200"
        >
          <p className="font-fredoka text-green-700">All assets uploaded! 🎉</p>
          <Button variant="soft" size="sm" onClick={() => setPendingFiles([])}>
            Upload More
          </Button>
        </motion.div>
      )}
    </div>
  )
}
