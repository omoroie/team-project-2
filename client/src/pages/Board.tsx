import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';

export default function Board() {
  const { t } = useLanguage();
  const { state } = useApp();

  if (!state.isAuthenticated || !state.user?.isCorporate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">This board is only accessible to corporate users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Board Service</h1>
        <p className="text-gray-600">Board service is not available in this version.</p>
      </div>
    </div>
  );
}
