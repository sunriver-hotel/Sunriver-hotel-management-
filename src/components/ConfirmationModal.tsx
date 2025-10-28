import React, { useContext } from 'react';
import { AppContext } from '../App';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
    const { t } = useContext(AppContext);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                <h2 className="text-lg font-bold mb-4">{title}</h2>
                <div className="text-gray-700">{message}</div>
                <div className="mt-6 flex justify-end space-x-4">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">{t('cancel')}</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-[#e6c872] text-white rounded-md hover:bg-amber-500">{t('confirm')}</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
