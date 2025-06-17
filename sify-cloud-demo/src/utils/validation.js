// Validation utilities for form inputs and data
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone) => {
  // Basic phone validation - allows various formats
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0
}

export const validateDealId = (dealId) => {
  // Deal ID should be alphanumeric with hyphens
  const dealIdRegex = /^[A-Z0-9\-]+$/
  return dealIdRegex.test(dealId)
}

export const validateProjectName = (name) => {
  return name && name.trim().length >= 3 && name.trim().length <= 100
}

export const validateCustomerName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 100
}

// Form validation for NewProject component
export const validateNewProjectForm = (formData) => {
  const errors = {}

  if (!validateRequired(formData.customerName)) {
    errors.customerName = 'Customer name is required'
  } else if (!validateCustomerName(formData.customerName)) {
    errors.customerName = 'Customer name must be between 2-100 characters'
  }

  if (!validateRequired(formData.projectName)) {
    errors.projectName = 'Project name is required'
  } else if (!validateProjectName(formData.projectName)) {
    errors.projectName = 'Project name must be between 3-100 characters'
  }

  if (!validateRequired(formData.contactEmail)) {
    errors.contactEmail = 'Contact email is required'
  } else if (!validateEmail(formData.contactEmail)) {
    errors.contactEmail = 'Please enter a valid email address'
  }

  if (formData.phone && !validatePhone(formData.phone)) {
    errors.phone = 'Please enter a valid phone number'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Validation for Excel upload
export const validateExcelUpload = (file) => {
  const errors = []
  
  if (!file) {
    errors.push('Please select a file to upload')
    return { isValid: false, errors }
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024 // 10MB in bytes
  if (file.size > maxSize) {
    errors.push('File size must be less than 10MB')
  }

  // Check file type
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv' // .csv
  ]
  
  if (!allowedTypes.includes(file.type)) {
    errors.push('Please upload a valid Excel file (.xlsx, .xls) or CSV file')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validation for pricing/BoQ
export const validatePricing = (price) => {
  const numPrice = parseFloat(price)
  
  if (isNaN(numPrice)) {
    return { isValid: false, error: 'Price must be a valid number' }
  }
  
  if (numPrice < 0) {
    return { isValid: false, error: 'Price cannot be negative' }
  }
  
  if (numPrice > 1000000) {
    return { isValid: false, error: 'Price seems unusually high, please verify' }
  }
  
  return { isValid: true }
}

export const validateDiscount = (discount, originalPrice) => {
  const numDiscount = parseFloat(discount)
  const numOriginalPrice = parseFloat(originalPrice)
  
  if (isNaN(numDiscount)) {
    return { isValid: false, error: 'Discount must be a valid number' }
  }
  
  if (numDiscount < 0) {
    return { isValid: false, error: 'Discount cannot be negative' }
  }
  
  if (numDiscount > 50) {
    return { isValid: false, error: 'Discount cannot exceed 50%' }
  }
  
  const discountAmount = (numOriginalPrice * numDiscount) / 100
  if (discountAmount > numOriginalPrice) {
    return { isValid: false, error: 'Discount amount cannot exceed original price' }
  }
  
  return { isValid: true }
}

// Validation for comments
export const validateComment = (comment) => {
  if (!comment || comment.trim().length === 0) {
    return { isValid: false, error: 'Comment cannot be empty' }
  }
  
  if (comment.trim().length > 500) {
    return { isValid: false, error: 'Comment must be less than 500 characters' }
  }
  
  return { isValid: true }
}

// Generic validation helper
export const createValidator = (rules) => {
  return (value) => {
    for (const rule of rules) {
      const result = rule(value)
      if (!result.isValid) {
        return result
      }
    }
    return { isValid: true }
  }
}

// Common validation rules
export const validationRules = {
  required: (value) => ({
    isValid: validateRequired(value),
    error: 'This field is required'
  }),
  
  email: (value) => ({
    isValid: !value || validateEmail(value),
    error: 'Please enter a valid email address'
  }),
  
  phone: (value) => ({
    isValid: !value || validatePhone(value),
    error: 'Please enter a valid phone number'
  }),
  
  minLength: (min) => (value) => ({
    isValid: !value || value.length >= min,
    error: `Must be at least ${min} characters long`
  }),
  
  maxLength: (max) => (value) => ({
    isValid: !value || value.length <= max,
    error: `Must be no more than ${max} characters long`
  }),
  
  numeric: (value) => ({
    isValid: !value || !isNaN(parseFloat(value)),
    error: 'Must be a valid number'
  }),
  
  positive: (value) => ({
    isValid: !value || parseFloat(value) >= 0,
    error: 'Must be a positive number'
  })
}

