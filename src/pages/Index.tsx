
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import Login from "@/features/auth/components/Login";
import AdminDashboard from "@/features/dashboard/components/AdminDashboard";
import EmployeeDashboard from "@/features/dashboard/components/EmployeeDashboard";

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <Layout>
      {user.role === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />}
    </Layout>
  );
};

export default Index;
