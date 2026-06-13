import React from 'react';
import LegalDocumentPage from '../components/LegalDocumentPage';
import { PRIVACY_SECTIONS } from '../lib/legalContent';

const PrivacyPolicy: React.FC = () => (
  <LegalDocumentPage
    title="Gizlilik Politikası"
    subtitle="Kişisel verilerinizin 6698 sayılı KVKK kapsamında nasıl işlendiğini açıklar. Üyelik ve platform kullanımı için bu politikayı okumanız gerekir."
    sections={PRIVACY_SECTIONS}
  />
);

export default PrivacyPolicy;
