export type FormData = {
  firstname: string;
  lastname: string;
  othername: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type PasswordRequirement = {
  label: string;
  met: boolean;
}