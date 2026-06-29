import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<LoginFormValues>();

  async function onSubmit(values: LoginFormValues) {
    setError(null);
    try {
      await login(values.email, values.password);
      navigate('/admin');
    } catch {
      setError('E-mail ou senha inválidos');
    }
  }

  return (
    <section className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Entrar no MaxHub</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="E-mail" type="email" {...register('email', { required: true })} />
        <Input label="Senha" type="password" {...register('password', { required: true })} />
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={formState.isSubmitting}>
          Entrar
        </Button>
      </form>
    </section>
  );
}
