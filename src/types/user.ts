// types/user.ts
export type UserFormInput = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "employee";
};
