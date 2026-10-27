import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  Clock,
  BadgeCheck,
} from "lucide-react";
import { login } from "@/api/auth";
import type { LoginCredentials, ApiError } from "@/types/auth";
import InputField from "@/components/InputField";
import { saveAuth } from "@/utils/authStorage";
import LogoIcon from '@/assets/images/icon.webp'
import { getDefaultPanel } from '@/config/panels'

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectQuery = searchParams.get("redirect");
  const registerHref = redirectQuery
    ? `/register?redirect=${encodeURIComponent(redirectQuery)}`
    : "/register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: (data) => {
      // Guardar en el storage correcto según "remember"
      saveAuth(data.access_token, data.user, remember);

      toast.success("¡Bienvenido de vuelta!", {
        description: `Hola ${data.user.name}, has iniciado sesión correctamente.`,
      });

      // Si veníamos de una ruta protegida, volver ahí
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect") || "/admin/dashboard";

      if (redirect) {
        const targetRole = redirect.startsWith("/host/dashboard")
          ? "host"
          : redirect.startsWith("/admin/dashboard")
            ? "administrator"
            : redirect.startsWith("/support/dashboard")
              ? "support"
              : redirect.startsWith("/guest/dashboard")
                ? "guest"
                : redirect.startsWith("/affiliate/")
                  ? "affiliate"
                  : null;

        if (targetRole && data.user.role == targetRole) {
          navigate(redirect, { replace: true });
          return;
        }
      }

      // Sin redirect válido → primer panel disponible
      navigate(getDefaultPanel(data.user.role), { replace: true });
      //navigate(redirect, { replace: true })
    },
    onError: (error: ApiError) => {
      // Limpiar errores previos de campos
      setFieldErrors({});

      // Manejo de errores de validación (422)
      if (error.status === 422 && error.errors) {
        const errors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([key, messages]) => {
          errors[key] = messages[0];
        });
        setFieldErrors(errors);
        toast.error("Datos incompletos", {
          description: "Verifique los campos marcados en rojo.",
        });
        return;
      }

      // Mostrar Toast según el tipo de error
      if (error.status === 0) {
        toast.error("Sin conexión", {
          description:
            "No se pudo conectar con el servidor de Hospeda. Verifique su conexión a internet.",
        });
      } else if (error.status === 401) {
        toast.error("Credenciales incorrectas", {
          description: "El correo electrónico o la contraseña son incorrectos.",
        });
      } else if (error.status === 429) {
        toast.error("Demasiados intentos", {
          description:
            "Por seguridad, espere un momento antes de intentar de nuevo.",
        });
      } else {
        toast.error("Error al iniciar sesión", {
          description: error.message,
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    // Validación local
    if (!email.trim()) {
      setFieldErrors({ email: "El correo electrónico es obligatorio" });
      return;
    }
    if (!password) {
      setFieldErrors({ password: "La contraseña es obligatoria" });
      return;
    }

    mutation.mutate({ email, password, remember });
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-vivid-tangerine-600 via-vivid-tangerine-700 to-vivid-tangerine-900">
        {/* Imagen de fondo */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-vivid-tangerine-900/90 via-vivid-tangerine-800/60 to-vivid-tangerine-600/40" />

        {/* Contenido */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/80 backdrop-blur flex items-center justify-center">
            <img src={LogoIcon} alt="Hospeda Logo" className="w-12" />
            </div>
            <span className="text-xl font-semibold tracking-tight">
              Hospeda
            </span>
          </div>

          {/* Texto central */}
          <div className="max-w-md">
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Administra tu hospedaje desde un solo lugar
            </h2>
            <p className="text-white/80 mb-8 leading-relaxed">
              Reservaciones, propiedades, pagos y huéspedes. Todo sincronizado
              en tiempo real.
            </p>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck size={16} />
                </div>
                <span className="text-sm text-white/90">
                  Reservas y pagos protegidos de extremo a extremo
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <BadgeCheck size={16} />
                </div>
                <span className="text-sm text-white/90">
                  Anfitriones e inmuebles verificados uno por uno
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock size={16} />
                </div>
                <span className="text-sm text-white/90">
                  Precios finales transparentes, sin cargos ocultos
                </span>
              </li>
            </ul>
          </div>

          {/* Footer */}
          <p className="text-sm text-white/60">
            © 2026 Hospeda. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-surface-warm">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-cool-steel-500 hover:text-cool-steel-800 transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>

          <h1 className="text-3xl font-bold text-cool-steel-900 mb-2">
            Bienvenido de vuelta
          </h1>
          <p className="text-sm text-cool-steel-500 mb-8">
            Ingresa tus credenciales para entrar al panel administrativo.
          </p>

          {/* Alerta de error general */}
          {mutation.isError && (
            <div className="flex items-start gap-2.5 rounded-lg border border-vivid-tangerine-200 bg-vivid-tangerine-50 p-3.5 mb-6">
              <AlertCircle size={18} className="text-vivid-tangerine-500 shrink-0 mt-0.5" />
              <p className="text-sm text-vivid-tangerine-700">
                {(mutation.error as ApiError)?.message ||
                  "No se pudo conectar con el servidor de Hospeda."}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="tu@hospeda.com"
              icon={<Mail size={18} />}
              error={fieldErrors.email}
              autoComplete="email"
            />

            <InputField
              label="Contraseña"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              icon={<Lock size={18} />}
              error={fieldErrors.password}
              autoComplete="current-password"
              action={
                <Link
                  to="/forgot-password"
                  className="text-sm text-vivid-tangerine-600 hover:text-vivid-tangerine-700 font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              }
            />

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-cool-steel-300 text-vivid-tangerine-600 focus:ring-vivid-tangerine-500"
              />
              <span className="text-sm text-cool-steel-700">
                Mantener sesión iniciada
              </span>
            </label>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-lg bg-vivid-tangerine-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-vivid-tangerine-700 focus:outline-none focus:ring-2 focus:ring-vivid-tangerine-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="text-center text-sm text-cool-steel-500 mt-6">
            ¿Aún no tienes cuenta?{" "}
            <Link
              to={registerHref}
              className="text-vivid-tangerine-600 hover:text-vivid-tangerine-700 font-medium"
            >
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
