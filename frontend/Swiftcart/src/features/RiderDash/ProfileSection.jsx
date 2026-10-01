import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, 
  Bike, 
  Phone, 
  ShieldCheck, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  Edit2, 
  Save, 
  X, 
  Camera, 
  FileText,
  AlertCircle
} from 'lucide-react';

// BASE_URL matched with Django: path('api/delivery-partner/', include('Delivery.urls'))
const BASE_URL = 'http://127.0.0.1:8000/api/delivery-partner';

export default function ProfileSection() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile Form State
  const [profile, setProfile] = useState({
    Partner_id: '',
    fullName: '',
    mobile: '',
    Vehicle_type: 'bike',
    Vehicle_number: '',
    profile_image: null,
    rating: 0,
    total_deliveries: 0,
    is_verified: false,
    is_online: false,
  });

  const [editMode, setEditMode] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [newImageFile, setNewImageFile] = useState(null);

  // Partner Documents State
  const [documents, setDocuments] = useState({
    Driving_licens: null,
    Vehicle_Rc: null,
    Aadhar_docs: null,
    verified: false
  });

  const [docFiles, setDocFiles] = useState({
    Driving_licens: null,
    Vehicle_Rc: null,
    Aadhar_docs: null
  });

  useEffect(() => {
    fetchProfileData();
    fetchDocumentsData();
  }, []);

  const getAuthHeader = () => {
    const token = localStorage.getItem('access_token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    };
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // Fetch DeliveryPartnerProfileView GET
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/profile/`, getAuthHeader());
      setProfile(response.data);
      if (response.data.profile_image) {
        setPreviewImage(response.data.profile_image);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        showMessage('error', 'Profile nahi mili. Kripya registration poora karein.');
      } else {
        showMessage('error', 'Profile details load karne me error aaya.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch PartnerDocumentUploadView GET (Handles initial 404 cleanly)
  const fetchDocumentsData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/documents/`, getAuthHeader());
      setDocuments(response.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setDocuments({
          Driving_licens: null,
          Vehicle_Rc: null,
          Aadhar_docs: null,
          verified: false
        });
      } else {
        console.warn('Error fetching documents:', err.message);
      }
    }
  };

  // Update Profile Details - DeliveryPartnerProfileView PATCH
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append('fullName', profile.fullName);
    formData.append('mobile', profile.mobile);
    formData.append('Vehicle_type', profile.Vehicle_type);
    formData.append('Vehicle_number', profile.Vehicle_number);

    if (newImageFile) {
      formData.append('profile_image', newImageFile);
    }

    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'multipart/form-data',
        }
      };

      const response = await axios.patch(`${BASE_URL}/profile/`, formData, config);
      setProfile(response.data);
      setEditMode(false);
      setNewImageFile(null);
      showMessage('success', 'Profile aur Vehicle info successfully update ho gayi!');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Profile update fail ho gaya.');
    } finally {
      setSaving(false);
    }
  };

  // Upload Documents - PartnerDocumentUploadView POST
  const handleDocUpload = async (docKey) => {
    const file = docFiles[docKey];
    if (!file) return;

    setUploadingDoc(true);
    const formData = new FormData();
    formData.append(docKey, file);

    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'multipart/form-data',
        }
      };

      const response = await axios.post(`${BASE_URL}/documents/`, formData, config);
      setDocuments(response.data.data || response.data);
      setDocFiles(prev => ({ ...prev, [docKey]: null }));
      showMessage('success', `${docKey.replace('_', ' ')} upload ho gaya!`);
    } catch (err) {
      showMessage('error', 'Document upload fail ho gaya. Dobara try karein.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  if (loading) {
    return (
      <div className="min-h-[350px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Banner */}
      {message.text && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Profile Header Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          
          {/* Avatar Image */}
          <div className="relative group">
            <div className="w-28 h-28 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-xs flex items-center justify-center">
              {previewImage ? (
                <img src={previewImage} alt="Rider Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-slate-400" />
              )}
            </div>

            {editMode && (
              <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer rounded-2xl transition-opacity">
                <Camera size={20} className="text-white mb-1" />
                <span className="text-[10px] font-semibold text-white">Change</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{profile.fullName || "Rider Partner"}</h1>
              
              <div className="flex justify-center sm:justify-start gap-2">
                {profile.is_verified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    <ShieldCheck size={13} /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                    <Clock size={13} /> Verification Pending
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-500 font-mono">Partner ID: <span className="text-indigo-600 font-bold">{profile.Partner_id || 'N/A'}</span></p>

            {/* Rider Quick Stats */}
            <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-3">
              <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Rating</span>
                <span className="text-amber-500 font-bold text-xs">★ {profile.rating || '0.0'}</span>
              </div>
              <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Deliveries</span>
                <span className="text-slate-800 font-bold text-xs">{profile.total_deliveries}</span>
              </div>
            </div>
          </div>

          {/* Edit Controls */}
          <div>
            {!editMode ? (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
              >
                <Edit2 size={14} /> Edit Profile
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setEditMode(false); setPreviewImage(profile.profile_image); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-colors"
              >
                <X size={14} /> Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User size={16} /> Personal & Vehicle Information
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'documents'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText size={16} /> Documents Verification
        </button>
      </div>

      {/* TAB 1: Profile & Vehicle Form */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSave} className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled={!editMode}
                  value={profile.fullName || ''}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 disabled:bg-slate-100/60 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
                <User size={16} className="absolute right-3.5 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled={!editMode}
                  value={profile.mobile || ''}
                  onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 disabled:bg-slate-100/60 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
                <Phone size={16} className="absolute right-3.5 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Vehicle Type
              </label>
              <div className="relative">
                <select
                  disabled={!editMode}
                  value={profile.Vehicle_type || 'bike'}
                  onChange={(e) => setProfile({ ...profile, Vehicle_type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 disabled:bg-slate-100/60 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 appearance-none"
                >
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                  <option value="cycle">Cycle</option>
                </select>
                <Bike size={16} className="absolute right-3.5 top-3 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Vehicle Number
              </label>
              <input
                type="text"
                disabled={!editMode}
                value={profile.Vehicle_number || ''}
                onChange={(e) => setProfile({ ...profile, Vehicle_number: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 disabled:bg-slate-100/60 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 uppercase"
                required
              />
            </div>
          </div>

          {editMode && (
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2.5 rounded-xl font-semibold text-xs transition-colors"
              >
                <Save size={15} />
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          )}
        </form>
      )}

      {/* TAB 2: Documents Verification Form */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">Verification Documents</h2>
              <p className="text-xs text-slate-500">Upload legal documents required for partner account verification.</p>
            </div>

            {documents.verified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                <CheckCircle2 size={14} /> Documents Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                <Clock size={14} /> Verification Pending
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DocCard
              title="Driving License"
              docKey="Driving_licens"
              currentDoc={documents.Driving_licens}
              selectedFile={docFiles.Driving_licens}
              onFileSelect={(file) => setDocFiles({ ...docFiles, Driving_licens: file })}
              onUpload={() => handleDocUpload('Driving_licens')}
              loading={uploadingDoc}
            />

            <DocCard
              title="Vehicle RC"
              docKey="Vehicle_Rc"
              currentDoc={documents.Vehicle_Rc}
              selectedFile={docFiles.Vehicle_Rc}
              onFileSelect={(file) => setDocFiles({ ...docFiles, Vehicle_Rc: file })}
              onUpload={() => handleDocUpload('Vehicle_Rc')}
              loading={uploadingDoc}
            />

            <DocCard
              title="Identity Document"
              docKey="Aadhar_docs"
              currentDoc={documents.Aadhar_docs}
              selectedFile={docFiles.Aadhar_docs}
              onFileSelect={(file) => setDocFiles({ ...docFiles, Aadhar_docs: file })}
              onUpload={() => handleDocUpload('Aadhar_docs')}
              loading={uploadingDoc}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Document Card Component
function DocCard({ title, docKey, currentDoc, selectedFile, onFileSelect, onUpload, loading }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700">{title}</span>
          {currentDoc ? (
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              Uploaded
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
              Missing
            </span>
          )}
        </div>

        <div className="h-28 rounded-xl bg-white border border-dashed border-slate-300 flex flex-col items-center justify-center overflow-hidden relative group">
          {selectedFile ? (
            <div className="p-2 text-center">
              <FileText size={24} className="mx-auto text-indigo-600 mb-1" />
              <p className="text-[11px] text-slate-700 font-medium truncate max-w-[130px]">{selectedFile.name}</p>
            </div>
          ) : currentDoc ? (
            <img src={currentDoc} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-3">
              <UploadCloud size={24} className="mx-auto text-slate-400 mb-1" />
              <p className="text-[10px] text-slate-400">Click to select file</p>
            </div>
          )}

          <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[11px] font-semibold text-white bg-indigo-600 px-2.5 py-1 rounded-lg">
              Choose File
            </span>
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
            />
          </label>
        </div>
      </div>

      {selectedFile && (
        <button
          type="button"
          disabled={loading}
          onClick={onUpload}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          <UploadCloud size={14} /> {loading ? 'Uploading...' : 'Save File'}
        </button>
      )}
    </div>
  );
}