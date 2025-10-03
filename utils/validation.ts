import * as yup from 'yup';

// Login validation schema
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  password: yup
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Vui lòng nhập mật khẩu'),
});

// Register validation schema
export const registerSchema = yup.object().shape({
  username: yup
    .string()
    .min(3, 'Tên người dùng phải có ít nhất 3 ký tự')
    .max(20, 'Tên người dùng không được quá 20 ký tự')
    .required('Vui lòng nhập tên người dùng'),
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Vui lòng nhập email'),
  password: yup
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số'
    )
    .required('Vui lòng nhập mật khẩu'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Mật khẩu xác nhận không khớp')
    .required('Vui lòng xác nhận mật khẩu'),
  phoneNumber: yup
    .string()
    .matches(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
    .optional(),
});

// Activity form validation schema
export const activitySchema = yup.object().shape({
  type: yup
    .string()
    .oneOf(['transport', 'energy', 'food', 'plastic', 'water'], 'Loại hoạt động không hợp lệ')
    .required('Vui lòng chọn loại hoạt động'),
  category: yup
    .string()
    .required('Vui lòng chọn danh mục'),
  value: yup
    .number()
    .positive('Giá trị phải lớn hơn 0')
    .required('Vui lòng nhập số lượng'),
  description: yup
    .string()
    .max(200, 'Mô tả không được quá 200 ký tự')
    .optional(),
});

// Challenge form validation schema
export const challengeSchema = yup.object().shape({
  name: yup
    .string()
    .min(3, 'Tên thử thách phải có ít nhất 3 ký tự')
    .max(100, 'Tên thử thách không được quá 100 ký tự')
    .required('Vui lòng nhập tên thử thách'),
  description: yup
    .string()
    .min(10, 'Mô tả phải có ít nhất 10 ký tự')
    .max(500, 'Mô tả không được quá 500 ký tự')
    .required('Vui lòng nhập mô tả'),
  startDate: yup
    .date()
    .min(new Date(), 'Ngày bắt đầu phải sau ngày hiện tại')
    .required('Vui lòng chọn ngày bắt đầu'),
  endDate: yup
    .date()
    .min(yup.ref('startDate'), 'Ngày kết thúc phải sau ngày bắt đầu')
    .required('Vui lòng chọn ngày kết thúc'),
});

// Profile update validation schema
export const profileSchema = yup.object().shape({
  username: yup
    .string()
    .min(3, 'Tên người dùng phải có ít nhất 3 ký tự')
    .max(20, 'Tên người dùng không được quá 20 ký tự')
    .optional(),
  email: yup
    .string()
    .email('Email không hợp lệ')
    .optional(),
  phoneNumber: yup
    .string()
    .matches(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
    .optional(),
  dateOfBirth: yup
    .date()
    .max(new Date(), 'Ngày sinh không được sau ngày hiện tại')
    .optional(),
});

// Password change validation schema
export const passwordChangeSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .required('Vui lòng nhập mật khẩu hiện tại'),
  newPassword: yup
    .string()
    .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Mật khẩu mới phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số'
    )
    .required('Vui lòng nhập mật khẩu mới'),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp')
    .required('Vui lòng xác nhận mật khẩu mới'),
});
