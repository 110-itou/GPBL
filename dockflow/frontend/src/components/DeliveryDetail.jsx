import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getDeliveries, getMovementLogs, getAttachments, deleteDelivery } from '../services/api';
import { ArrowLeft, Edit, MapPin, Trash2, Calendar, Package, FileText, Image, File, History } from 'lucide-react';

const AttachmentPreview = ({ attachment }) => {
  const [hasError, setHasError] = useState(false);

  if (attachment.file_type === 'photo' && attachment.file_url && !hasError) {
    return (
      <img
        src={attachment.file_url}
        alt={attachment.file_name || '添付写真'}
        className="w-16 h-16 object-cover rounded border border-gray-200"
        onError={() => setHasError(true)}
      />
    );
  }

  return attachment.file_type === 'photo' ? (
    <Image className="w-8 h-8 text-blue-500" />
  ) : (
    <FileText className="w-8 h-8 text-red-500" />
  );
};

const DeliveryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedUser } = useUser();
  const [delivery, setDelivery] = useState(null);
  const [movementLogs, setMovementLogs] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadDeliveryData();
  }, [id]);

  const loadDeliveryData = async () => {
    try {
      setLoading(true);
      const [deliveryRes, movementRes, attachmentsRes] = await Promise.all([
        getDeliveries(),
        getMovementLogs(id),
        getAttachments(id)
      ]);

      const deliveryData = deliveryRes.data.find(d => d.id === parseInt(id));
      if (!deliveryData) {
        navigate('/delivery-list');
        return;
      }

      setDelivery(deliveryData);
      setMovementLogs(movementRes.data);
      setAttachments(attachmentsRes.data);
    } catch (error) {
      console.error('Error loading delivery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '納入予定': return 'text-blue-600 bg-blue-50';
      case '納入済': return 'text-green-600 bg-green-50';
      case '移動済': return 'text-orange-600 bg-orange-50';
      case '使用済': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleEdit = () => {
    navigate(`/delivery/${id}/edit`);
  };

  const handleLocationChange = () => {
    navigate(`/delivery/${id}/location-change`);
  };

  const handleDelete = async () => {
    try {
      await deleteDelivery(id);
      navigate('/delivery-list');
    } catch (error) {
      console.error('Error deleting delivery:', error);
      alert('削除に失敗しました。もう一度お試しください。');
    }
  };

  const canEdit = selectedUser?.role === 'admin' || delivery?.created_by === selectedUser?.id;

  const handleBack = () => {
    navigate('/delivery-list');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600"></div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">納入物が見つかりません</p>
          <button onClick={handleBack} className="mt-4 btn-primary">
            一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-16 items-center py-3 sm:py-0">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="touch-target mr-2 rounded-lg p-2 transition-colors hover:bg-gray-100 sm:mr-3"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex min-w-0 items-center rounded-lg p-1 pr-3 transition-colors hover:bg-gray-50"
                aria-label="トップへ戻る"
              >
                <div className="w-10 h-10 bg-navy-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold">DF</span>
                </div>
                <div className="text-left">
                  <h1 className="text-xl font-bold text-navy-800">DockFlow</h1>
                  <p className="text-sm text-gray-500">造船部材リアルタイム管理システム</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-8">
        {/* Title and Actions */}
        <div className="mb-6 sm:mb-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="break-words text-xl font-bold text-navy-800 sm:text-2xl">
              {delivery.item_name}
            </h2>
            <div className="flex min-w-0 items-center space-x-2">
              <div className="h-4 w-4 flex-shrink-0 rounded-full" style={{ backgroundColor: delivery.color_code }}></div>
              <span className="truncate text-sm text-gray-600">{delivery.vendor_name}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(delivery.status)}`}>
              {delivery.status}
            </span>
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700">
              場所: {delivery.current_location}
            </span>
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700">
              個数: {delivery.quantity}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
            {canEdit && (
              <>
                <button
                  onClick={handleEdit}
                  className="btn-primary w-full sm:w-auto"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  編集
                </button>
                <button
                  onClick={handleLocationChange}
                  className="btn-secondary w-full sm:w-auto"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  場所変更
                </button>
              </>
            )}
            {selectedUser?.role === 'admin' && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-danger w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                削除
              </button>
            )}
          </div>
        </div>

        {/* Detail Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="rounded-lg bg-white p-4 shadow sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              基本情報
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">システムID</span>
                <span className="font-medium">{delivery.system_id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">品名</span>
                <span className="font-medium">{delivery.item_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">発注番号</span>
                <span className="font-medium">{delivery.order_no || '未設定'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">業者</span>
                <span className="font-medium">{delivery.vendor_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">状態</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.status)}`}>
                  {delivery.status}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">場所</span>
                <span className="font-medium">{delivery.current_location}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">個数</span>
                <span className="font-medium">{delivery.quantity}</span>
              </div>
            </div>
          </div>

          {/* Date Information */}
          <div className="rounded-lg bg-white p-4 shadow sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              日付情報
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">納入予定日</span>
                <span className="font-medium">{delivery.scheduled_date || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">受取日</span>
                <span className="font-medium">{delivery.received_date || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">作成日時</span>
                <span className="font-medium">
                  {new Date(delivery.created_at).toLocaleString('ja-JP')}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">更新日時</span>
                <span className="font-medium">
                  {new Date(delivery.updated_at).toLocaleString('ja-JP')}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">作成者</span>
                <span className="font-medium">{delivery.created_by_name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Memo */}
        {delivery.memo && (
          <div className="mt-6 rounded-lg bg-white p-4 shadow sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              メモ
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{delivery.memo}</p>
          </div>
        )}

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mt-6 rounded-lg bg-white p-4 shadow sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <File className="w-5 h-5 mr-2" />
              添付ファイル
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex min-w-0 items-center space-x-3">
                    <AttachmentPreview attachment={attachment} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {attachment.file_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {attachment.file_type === 'photo' ? '写真' : 'PDF'}
                      </p>
                    </div>
                    <a
                      href={attachment.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-navy-600 hover:text-navy-700 text-sm"
                    >
                      開く
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Movement History */}
        {movementLogs.length > 0 && (
          <div className="mt-6 rounded-lg bg-white p-4 shadow sm:p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <History className="w-5 h-5 mr-2" />
              移動履歴
            </h3>
            <div className="space-y-3">
              {movementLogs.map((log, index) => (
                <div key={log.id} className="flex flex-col gap-3 border-b border-gray-100 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center space-x-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-navy-100">
                      <MapPin className="w-4 h-4 text-navy-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-medium text-gray-900">
                        {log.before_location ? `場所 ${log.before_location} → ${log.after_location}` : `場所 ${log.after_location} に配置`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {log.moved_by_name} • {new Date(log.moved_at).toLocaleString('ja-JP')}
                      </p>
                    </div>
                  </div>
                  {log.memo && (
                    <p className="text-sm text-gray-600">{log.memo}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">削除の確認</h3>
            <p className="text-gray-600 mb-6">
              この納入物を削除してもよろしいですか？この操作は元に戻せません。
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 btn-secondary"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 btn-danger"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDetail;
