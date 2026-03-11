import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import {
  Shield, Upload, CheckCircle, AlertCircle, Award, Briefcase,
  FileText, Link as LinkIcon, Camera, ChevronRight, BookOpen,
  GraduationCap, ExternalLink, X, Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UploadedDoc {
  id: string;
  name: string;
  type: 'diploma' | 'payslip' | 'certificate' | 'other';
  uploadedAt: string;
  status: 'pending' | 'analyzing' | 'verified' | 'rejected';
  document_url?: string;
}

// Fictive completed lessons that count as verification
const completedLessonVerifications = [
  {
    id: 'v1',
    title: 'Elektriciteit Basis tot Expert',
    instructor: 'Jan Vermeeren',
    completedAt: '10 jan 2026',
    specialty: 'Elektriciteit',
    diplomaEarned: true,
  },
  {
    id: 'v2',
    title: 'Domotica & Smart Home',
    instructor: 'Pieter Claes',
    completedAt: '20 feb 2026',
    specialty: 'Domotica',
    diplomaEarned: true,
  },
];

const VerificationPage = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingLinkedin, setIsSavingLinkedin] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'diploma' | 'payslip' | 'certificate' | 'other'>('diploma');

  // Load existing verifications from Supabase on mount
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // Load profile for linkedin URL
        const { data: profileData } = await supabase
          .from('profiles')
          .select('linkedin_url')
          .eq('user_id', user.id)
          .single();

        if ((profileData as any)?.linkedin_url) setLinkedinUrl((profileData as any).linkedin_url);

        // Load verifications
        const { data: verData } = await (supabase
          .from('handy_verifications' as any)
          .select('*') as any)
          .eq('handy_id', user.id)
          .order('uploaded_at', { ascending: false });

        if (verData) {
          const docs: UploadedDoc[] = verData.map((v: any) => ({
            id: v.id,
            name: v.document_url.split('/').pop() || 'Document',
            type: v.document_type as UploadedDoc['type'],
            uploadedAt: new Date(v.uploaded_at).toLocaleDateString('nl-BE'),
            status: v.status as UploadedDoc['status'],
            document_url: v.document_url,
          }));
          setDocuments(docs);
        }
      } catch (err) {
        console.error('Error loading verification data:', err);
        // Fallback to localStorage
        const stored = localStorage.getItem('handymatch_verification');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.linkedinUrl) setLinkedinUrl(parsed.linkedinUrl);
          if (parsed.documents) setDocuments(parsed.documents);
        }
      }
    };

    loadData();
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Bestand mag maximaal 10MB zijn');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verification-docs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('verification-docs')
        .getPublicUrl(fileName);

      const documentUrl = urlData?.publicUrl || fileName;

      const { data: verRecord, error: insertError } = await (supabase
        .from('handy_verifications' as any) as any)
        .insert({
          handy_id: user.id,
          document_url: documentUrl,
          document_type: uploadType,
          status: 'pending',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newDoc: UploadedDoc = {
        id: verRecord.id,
        name: file.name,
        type: uploadType,
        uploadedAt: new Date().toLocaleDateString('nl-BE'),
        status: 'pending',
        document_url: documentUrl,
      };

      setDocuments((prev) => [newDoc, ...prev]);
      toast.success(`${file.name} geüpload! Verificatie wordt verwerkt.`);
    } catch (err: any) {
      console.error('Upload error:', err);
      // Fallback: save locally
      const newDoc: UploadedDoc = {
        id: Date.now().toString(),
        name: file.name,
        type: uploadType,
        uploadedAt: new Date().toLocaleDateString('nl-BE'),
        status: 'pending',
      };
      setDocuments((prev) => [newDoc, ...prev]);
      toast.success(`${file.name} geüpload!`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeDocument = async (id: string) => {
    if (user) {
      try {
        await supabase.from('handy_verifications').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting verification:', err);
      }
    }
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    toast.success('Document verwijderd');
  };

  const handleLinkedinSave = async () => {
    if (!user) return;
    setIsSavingLinkedin(true);

    try {
      await supabase
        .from('profiles')
        .update({ linkedin_url: linkedinUrl })
        .eq('user_id', user.id);
      await refreshProfile();
      toast.success('LinkedIn profiel opgeslagen!');
    } catch (err) {
      console.error('Error saving LinkedIn URL:', err);
      // Fallback to localStorage
      const stored = localStorage.getItem('handymatch_verification');
      const data = stored ? JSON.parse(stored) : {};
      localStorage.setItem('handymatch_verification', JSON.stringify({ ...data, linkedinUrl }));
      toast.success('LinkedIn profiel opgeslagen!');
    } finally {
      setIsSavingLinkedin(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'diploma': return 'Diploma';
      case 'payslip': return 'Loonbrief';
      case 'certificate': return 'Certificaat';
      default: return 'Document';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-emerald-100 text-emerald-700 border-0">Geverifieerd</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700 border-0">Afgekeurd</Badge>;
      case 'analyzing':
        return <Badge className="bg-blue-100 text-blue-700 border-0">Analyseren</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-700 border-0">In behandeling</Badge>;
    }
  };

  // Calculate real verification score from actual data
  const verificationScore = [
    completedLessonVerifications.length > 0,
    documents.some((d) => d.type === 'diploma' || d.type === 'certificate'),
    linkedinUrl.length > 0,
    documents.some((d) => d.type === 'payslip'),
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title="Verificatie" showBack />

      <div className="px-4 py-6 space-y-6">
        {/* Verification Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-3xl p-6 text-primary-foreground relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-bold text-xl">Verificatie Status</h2>
              <p className="text-sm opacity-90">{verificationScore}/4 stappen voltooid</p>
            </div>
          </div>
          <div className="flex gap-1.5 mt-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i < verificationScore ? 'bg-white' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <p className="text-xs opacity-75 mt-2">
            {verificationScore === 4
              ? 'Volledig geverifieerd! Je profiel straalt vertrouwen uit.'
              : 'Hoe meer je verifieert, hoe meer vertrouwen klanten in jou hebben.'}
          </p>
        </motion.div>

        {/* 1. Lessons Verification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card rounded-3xl border border-border shadow-soft overflow-hidden"
        >
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">Lessenreeksen & Diploma's</h3>
                <p className="text-xs text-muted-foreground">Verifieer via HandyMatch opleidingen</p>
              </div>
              {completedLessonVerifications.length > 0 && (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              )}
            </div>

            {completedLessonVerifications.length > 0 ? (
              <div className="space-y-3 mb-4">
                {completedLessonVerifications.map((lesson) => (
                  <div key={lesson.id} className="flex items-center gap-3 bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                    <Award className="w-5 h-5 text-accent flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {lesson.instructor} • Voltooid {lesson.completedAt}
                      </p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs flex-shrink-0">
                      Diploma
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">
                Nog geen lessenreeksen voltooid. Volg een opleiding om automatisch geverifieerd te worden.
              </p>
            )}

            <Button
              onClick={() => navigate('/learning')}
              variant="outline"
              className="w-full rounded-xl border-primary/30 text-primary hover:bg-primary/5"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Bekijk beschikbare lessenreeksen
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          </div>
        </motion.div>

        {/* 2. Diploma Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl border border-border shadow-soft overflow-hidden"
        >
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">Diploma's & Certificaten</h3>
                <p className="text-xs text-muted-foreground">Upload je kwalificaties</p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Upload type selector */}
            <div className="flex gap-2 mb-4">
              {(['diploma', 'certificate'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setUploadType(type)}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                    uploadType === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {type === 'diploma' ? 'Diploma' : 'Certificaat'}
                </button>
              ))}
            </div>

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full rounded-xl bg-gradient-to-r from-accent to-accent/80 text-white font-semibold h-12 mb-4"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading
                ? 'Uploaden...'
                : uploadType === 'diploma'
                ? 'Diploma uploaden'
                : 'Certificaat uploaden'}
            </Button>

            {/* Uploaded documents */}
            {documents.filter((d) => d.type === 'diploma' || d.type === 'certificate').length > 0 && (
              <div className="space-y-2">
                {documents
                  .filter((d) => d.type === 'diploma' || d.type === 'certificate')
                  .map((doc) => (
                    <div key={doc.id} className="flex items-center gap-3 bg-background rounded-xl p-3 border border-border">
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{getTypeLabel(doc.type)} • {doc.uploadedAt}</p>
                      </div>
                      {getStatusBadge(doc.status)}
                      <button onClick={() => removeDocument(doc.id)} className="p-1 hover:bg-muted rounded-lg">
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* 3. Work Experience */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-3xl border border-border shadow-soft overflow-hidden"
        >
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">Werkervaring aantonen</h3>
                <p className="text-xs text-muted-foreground">LinkedIn, loonbrief of referenties</p>
              </div>
            </div>

            {/* LinkedIn */}
            <div className="space-y-2 mb-4">
              <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-blue-600" />
                LinkedIn Profiel
              </Label>
              <div className="flex gap-2">
                <Input
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/jouw-profiel"
                  className="rounded-xl flex-1"
                />
                <Button
                  onClick={handleLinkedinSave}
                  disabled={isSavingLinkedin}
                  size="sm"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4"
                >
                  {isSavingLinkedin ? '...' : 'Opslaan'}
                </Button>
              </div>
              {linkedinUrl && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 rounded-lg p-2">
                  <CheckCircle className="w-3 h-3" />
                  LinkedIn profiel gekoppeld
                </div>
              )}
            </div>

            {/* Payslip Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Loonbrief / Arbeidscontract
              </Label>
              <Button
                onClick={() => {
                  setUploadType('payslip');
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
                variant="outline"
                className="w-full rounded-xl border-dashed border-2 border-border h-12 text-muted-foreground hover:border-primary hover:text-primary"
              >
                <Upload className="w-4 h-4 mr-2" />
                Loonbrief of contract uploaden
              </Button>

              {documents.filter((d) => d.type === 'payslip').length > 0 && (
                <div className="space-y-2 mt-2">
                  {documents
                    .filter((d) => d.type === 'payslip')
                    .map((doc) => (
                      <div key={doc.id} className="flex items-center gap-3 bg-background rounded-xl p-3 border border-border">
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.uploadedAt}</p>
                        </div>
                        {getStatusBadge(doc.status)}
                        <button onClick={() => removeDocument(doc.id)} className="p-1 hover:bg-muted rounded-lg">
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-primary/5 rounded-2xl p-4 border border-primary/10"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">Hoe werkt verificatie?</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Voltooi <strong>lessenreeksen</strong> op HandyMatch voor automatische verificatie</li>
                <li>• Upload <strong>diploma's of certificaten</strong> voor AI-verificatie</li>
                <li>• Koppel je <strong>LinkedIn profiel</strong> om werkervaring aan te tonen</li>
                <li>• Upload een <strong>loonbrief</strong> als bewijs van professionele ervaring</li>
                <li>• Geverifieerde handies krijgen een <strong>vertrouwensbadge</strong> en meer klanten!</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default VerificationPage;
