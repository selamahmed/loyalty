import React from 'react';
import LegalDocumentPage from '../components/LegalDocumentPage';
import { TERMS_SECTIONS } from '../lib/legalContent';

const TermsOfService: React.FC = () => (
  <LegalDocumentPage
    title="Kullanım Şartları ve Platform Kuralları"
    subtitle="NexReward platformunu kullanmadan önce lütfen bu metni dikkatlice okuyun. Kayıt olarak bu şartları kabul etmiş sayılırsınız."
    sections={TERMS_SECTIONS}
  />
);

export default TermsOfService;
