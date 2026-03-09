import { useState, useRef } from 'react';
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

interface UploadedDoc {
  id: string;
  name: string;
  type: 'diploma' | 'payslip' | 'certificate' | 'other';
  uploadedAt: string;
  status: 'pending' | 'verified' | 'rejected';
}

const STORAGE_KEY = 'handymatch_verification';

const getStoredVerification = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  return {
    linkedinUrl: '',
    documents: [] as UploadedDoc[],
    diplomaVerified: false,
    experienceVerified: false,
    identityVerified: false,
    lessonsCompleted: 2,
  };
};

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
  const [verification, setVerification] = useState(getStoredVerification);
  const [linkedinUrl, setLinkedinUrl] = useState(verification.linkedinUrl || '');
  const [documents, setDocuments] = useState<UploadedDoc[]>(verification.documents || []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'diploma' | 'payslip' | 'certificate' | 'other'>('diploma');

  const saveVerification = (updates: any) => {
    const data = { ...verification, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setVerification(data);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Bestand mag maximaal 10MB zijn');
      return;
    }

    const newDoc: UploadedDoc = {
      id: Date.now().toString(),
      name: file.name,
      type: uploadType,
      uploadedAt: new Date().toLocaleDateString('nl-BE'),
      status: 'pending',
    };

    const updatedDocs = [...documents, newDoc];
    setDocuments(updatedDocs);
    saveVerification({ documents: updatedDocs });
    toast.success(`${file.name} geüpload! Verificatie wordt verwerkt.`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeDocument = (id: string) => {
    const updatedDocs = documents.filter(d => d.id !== id);
    setDocuments(updatedDocs);
    saveVerification({ documents: updatedDocs });
    toast.success('Document verwijderd');
  };

  const handleLinkedinSave = () => {
    saveVerification({ linkedinUrl });
    toast.success('LinkedIn profiel opgeslagen!');
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
      default:
        return <Badge className="bg-amber-100 text-amber-700 border-0">In behandeling</Badge>;
    }
  };

  const verificationScore = [
    completedLessonVerifications.length > 0,
    documents.some(d => d.type === 'diploma'),
    linkedinUrl.length > 0,
    documents.some(d => d.type === 'payslip'),
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
            {[0, 1, 2, 3].map(i => (
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
              ? '🎉 Volledig geverifieerd! Je profiel straalt vertrouwen uit.'
              : 'Hoe meer je verifieert, hoe meer vertrouwen klanten in jou hebben.'
            }
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
                {completedLessonVerifications.map(lesson => (
                  <div key={lesson.id} className="flex items-center gap-3 bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                    <Award className="w-5 h-5 text-accent flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {lesson.instructor} • Voltooid {lesson.completedAt}
                      </p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs flex-shrink-0">
                      ✓ Diploma
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
              {(['diploma', 'certificate'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setUploadType(type)}
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                    uploadType === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {type === 'diploma' ? '📜 Diploma' : '📋 Certificaat'}
                </button>
              ))}
            </div>

            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-xl bg-gradient-to-r from-accent to-accent/80 text-white font-semibold h-12 mb-4"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadType === 'diploma' ? 'Diploma uploaden' : 'Certificaat uploaden'}
            </Button>

            {/* Uploaded documents */}
            {documents.filter(d => d.type === 'diploma' || d.type === 'certificate').length > 0 && (
              <div className="space-y-2">
                {documents.filter(d => d.type === 'diploma' || d.type === 'certificate').map(doc => (
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
                  size="sm"
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4"
                >
                  Opslaan
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
                variant="outline"
                className="w-full rounded-xl border-dashed border-2 border-border h-12 text-muted-foreground hover:border-primary hover:text-primary"
              >
                <Upload className="w-4 h-4 mr-2" />
                Loonbrief of contract uploaden
              </Button>

              {documents.filter(d => d.type === 'payslip').length > 0 && (
                <div className="space-y-2 mt-2">
                  {documents.filter(d => d.type === 'payslip').map(doc => (
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
