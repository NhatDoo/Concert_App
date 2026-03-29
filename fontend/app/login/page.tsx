import { LoginForm } from '../../src/features/auth';

export default function LoginPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <LoginForm />
        </div>
    );
}
