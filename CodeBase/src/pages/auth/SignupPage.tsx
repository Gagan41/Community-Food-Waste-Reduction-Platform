import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, User, AlertCircle, Building, Home } from 'lucide-react';

// Account types
const accountTypes = [
  { id: 'donor', label: 'Food Donor', icon: <Building className="h-6 w-6" /> },
  { id: 'recipient', label: 'Food Recipient', icon: <Home className="h-6 w-6" /> },
];

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    accountType: '',
    fullName: '',
    username: '',
    organization: '',
    address: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user corrects the field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const selectAccountType = (type: string) => {
    setFormData(prev => ({ ...prev, accountType: type }));
    
    // Clear account type error if it exists
    if (errors.accountType) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.accountType;
        return newErrors;
      });
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.accountType) {
      newErrors.accountType = 'Please select an account type';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    }
    
    if (formData.accountType === 'donor' && !formData.organization) {
      newErrors.organization = 'Organization name is required for donors';
    }
    
    if (!formData.address) {
      newErrors.address = 'Address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare user data for Supabase
      const userData = {
        full_name: formData.fullName,
        username: formData.username,
        account_type: formData.accountType,
        organization: formData.organization,
        address: formData.address,
        phone: formData.phone,
      };
      
      const { data, error } = await signUp(formData.email, formData.password, userData);
      
      if (error) {
        throw error;
      }
      
      toast.success('Account created successfully! Please check your email to confirm your registration.');
      navigate('/auth/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account. Please try again.');
      setErrors({ general: error.message || 'Failed to create account' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-16 flex items-center justify-center">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto">
          <motion.div 
            className="bg-white rounded-xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Create Your Account</h1>
                <p className="text-gray-600 mt-2">Join the FoodShare community today</p>
              </div>
              
              {/* Step indicator */}
              <div className="relative mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                      step >= 1 ? 'bg-primary-500' : 'bg-gray-300'
                    }`}>
                      1
                    </div>
                    <span className="text-sm mt-1">Account</span>
                  </div>
                  
                  <div className="flex-1 h-1 mx-4 bg-gray-200">
                    <div 
                      className="h-full bg-primary-500 transition-all duration-300"
                      style={{ width: step >= 2 ? '100%' : '0%' }}
                    ></div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                      step >= 2 ? 'bg-primary-500' : 'bg-gray-300'
                    }`}>
                      2
                    </div>
                    <span className="text-sm mt-1">Profile</span>
                  </div>
                </div>
              </div>
              
              {errors.general && (
                <div className="mb-6 p-4 bg-error-50 text-error-700 rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p>{errors.general}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                {/* Step 1: Account Information */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Account Type
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {accountTypes.map(type => (
                          <div 
                            key={type.id}
                            onClick={() => selectAccountType(type.id)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              formData.accountType === type.id 
                                ? 'border-primary-500 bg-primary-50' 
                                : 'border-gray-200 hover:border-primary-200'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`p-2 rounded-full ${
                                formData.accountType === type.id 
                                  ? 'bg-primary-100 text-primary-600' 
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {type.icon}
                              </div>
                              <div className="ml-3">
                                <h3 className="font-medium">{type.label}</h3>
                                <p className="text-sm text-gray-500">
                                  {type.id === 'donor' 
                                    ? 'Share surplus food' 
                                    : 'Receive available food'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {errors.accountType && (
                        <p className="mt-1 text-sm text-error-600">{errors.accountType}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`pl-10 input-field ${errors.email ? 'border-error-500 focus:ring-error-500' : ''}`}
                          placeholder="your@email.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-error-600">{errors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type="password"
                          autoComplete="new-password"
                          value={formData.password}
                          onChange={handleChange}
                          className={`pl-10 input-field ${errors.password ? 'border-error-500 focus:ring-error-500' : ''}`}
                          placeholder="••••••••"
                        />
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-sm text-error-600">{errors.password}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          autoComplete="new-password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`pl-10 input-field ${errors.confirmPassword ? 'border-error-500 focus:ring-error-500' : ''}`}
                          placeholder="••••••••"
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-error-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full btn-primary py-3"
                    >
                      Continue
                    </button>
                  </div>
                )}
                
                {/* Step 2: Profile Information */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                          autoComplete="name"
                          value={formData.fullName}
                          onChange={handleChange}
                          className={`pl-10 input-field ${errors.fullName ? 'border-error-500 focus:ring-error-500' : ''}`}
                          placeholder="John Doe"
                        />
                      </div>
                      {errors.fullName && (
                        <p className="mt-1 text-sm text-error-600">{errors.fullName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="username"
                          name="username"
                          type="text"
                          autoComplete="username"
                          value={formData.username}
                          onChange={handleChange}
                          className={`pl-10 input-field ${errors.username ? 'border-error-500 focus:ring-error-500' : ''}`}
                          placeholder="johndoe"
                        />
                      </div>
                      {errors.username && (
                        <p className="mt-1 text-sm text-error-600">{errors.username}</p>
                      )}
                    </div>
                    
                    {formData.accountType === 'donor' && (
                      <div>
                        <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                          Organization Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Building className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="organization"
                            name="organization"
                            type="text"
                            value={formData.organization}
                            onChange={handleChange}
                            className={`pl-10 input-field ${errors.organization ? 'border-error-500 focus:ring-error-500' : ''}`}
                            placeholder="Your Organization"
                          />
                        </div>
                        {errors.organization && (
                          <p className="mt-1 text-sm text-error-600">{errors.organization}</p>
                        )}
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Home className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="address"
                          name="address"
                          type="text"
                          value={formData.address}
                          onChange={handleChange}
                          className={`pl-10 input-field ${errors.address ? 'border-error-500 focus:ring-error-500' : ''}`}
                          placeholder="123 Main St, City, State"
                        />
                      </div>
                      {errors.address && (
                        <p className="mt-1 text-sm text-error-600">{errors.address}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone (optional)
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="w-1/3 btn-outline py-3"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-2/3 btn-primary py-3 flex items-center justify-center"
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating Account...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;