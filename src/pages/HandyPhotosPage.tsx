import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Camera, Plus, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const defaultPhotos = [
  'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1585704032915-c3400305e979?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop',
];

const HandyPhotosPage = () => {
  const [photos, setPhotos] = useState<string[]>(() => {
    const saved = localStorage.getItem('handymatch_workphotos');
    return saved ? JSON.parse(saved) : defaultPhotos;
  });
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Foto mag maximaal 5MB zijn');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const newPhotos = [...photos, reader.result as string];
      setPhotos(newPhotos);
      localStorage.setItem('handymatch_workphotos', JSON.stringify(newPhotos));
      toast.success('Foto toegevoegd!');
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    localStorage.setItem('handymatch_workphotos', JSON.stringify(newPhotos));
    toast.success('Foto verwijderd');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Foto's beheren" showBack />

      <div className="px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h2 className="font-bold text-lg text-foreground mb-1">Werkfoto's</h2>
          <p className="text-sm text-muted-foreground">
            Upload foto's van je uitgevoerd werk. Dit verhoogt je zichtbaarheid en betrouwbaarheid.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {photos.map((photo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative group rounded-2xl overflow-hidden border border-border aspect-square"
            >
              <img src={photo} alt={`Werk ${index + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => setSelectedPhoto(photo)}
                  className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center"
                >
                  <Eye className="w-5 h-5 text-foreground" />
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="w-10 h-10 rounded-full bg-destructive/90 flex items-center justify-center"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </motion.div>
          ))}

          {/* Add photo tile */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center gap-2 hover:bg-primary/10 transition-colors"
          >
            <Plus className="w-8 h-8 text-primary" />
            <span className="text-sm font-medium text-primary">Toevoegen</span>
          </motion.button>
        </div>

        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

        <p className="text-xs text-muted-foreground text-center">
          {photos.length} foto's • Klanten zien deze foto's op je profiel
        </p>
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <img src={selectedPhoto} alt="Vergroot" className="max-w-full max-h-[80vh] rounded-2xl object-contain" />
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default HandyPhotosPage;
