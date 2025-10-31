
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  Brain,
  Database,
  TrendingUp,
  Users,
  Shield,
  Zap,
  LineChart,
  PieChart,
  Activity,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Sparkles,
  Lock,
  Globe,
  MessageSquare
} from 'lucide-react';

export default function Landing() {
  const [, setLocation] = useLocation();
  const { login, register, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');

  // Redirect if already authenticated
  if (isAuthenticated) {
    setLocation('/');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(loginIdentifier, loginPassword);
      window.location.href = '/';
    } catch (error) {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerPassword !== registerConfirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register(registerEmail, registerUsername, registerPassword);
      window.location.href = '/';
    } catch (error) {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Leverage advanced AI models to automatically generate insights from your data',
      color: 'text-purple-500'
    },
    {
      icon: TrendingUp,
      title: 'Trend Analysis',
      description: 'Identify patterns, forecast trends, and detect anomalies in real-time',
      color: 'text-blue-500'
    },
    {
      icon: Database,
      title: 'Multi-Source Integration',
      description: 'Connect to databases, APIs, CSV, Excel, and GraphQL endpoints seamlessly',
      color: 'text-green-500'
    },
    {
      icon: LineChart,
      title: 'Interactive Dashboards',
      description: 'Build beautiful, customizable dashboards with 15+ chart types',
      color: 'text-orange-500'
    },
    {
      icon: Users,
      title: 'Multi-Tenant Architecture',
      description: 'Enterprise-grade security with customer isolation and RBAC',
      color: 'text-red-500'
    },
    {
      icon: Zap,
      title: 'Real-Time Analytics',
      description: 'Process and visualize data in real-time with advanced aggregation',
      color: 'text-yellow-500'
    }
  ];

  const capabilities = [
    'Advanced Chart Builder with 15+ visualization types',
    'AI-generated insights and recommendations',
    'Calculated fields and custom metrics',
    'Trend analysis and forecasting',
    'Anomaly detection and alerts',
    'Multi-tenant security architecture',
    'Role-based access control (RBAC)',
    'RESTful API and GraphQL connectors',
    'CSV/Excel data import',
    'Dashboard sharing and collaboration',
    'Export to PDF, PNG, and Excel',
    'Usage monitoring and analytics'
  ];

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowAuth(false)}>
              <BarChart3 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">ABEtworks</h1>
                <p className="text-sm text-muted-foreground">AIEnterpriseViz</p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => setShowAuth(false)}>
              Back to Home
            </Button>
          </div>

          <div className="max-w-md mx-auto mt-12">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome Back</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your analytics platform
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="identifier">Email or Username</Label>
                        <Input
                          id="identifier"
                          type="text"
                          placeholder="Enter your email or username"
                          value={loginIdentifier}
                          onChange={(e) => setLoginIdentifier(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </CardContent>
                  </form>
                </Card>
              </TabsContent>

              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Your Account</CardTitle>
                    <CardDescription>
                      Get started with AIEnterpriseViz today
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleRegister}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="you@company.com"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-username">Username</Label>
                        <Input
                          id="register-username"
                          type="text"
                          placeholder="Choose a username"
                          value={registerUsername}
                          onChange={(e) => setRegisterUsername(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Password</Label>
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="Create a strong password"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-confirm">Confirm Password</Label>
                        <Input
                          id="register-confirm"
                          type="password"
                          placeholder="Confirm your password"
                          value={registerConfirmPassword}
                          onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </Button>
                    </CardContent>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">ABEtworks</h1>
              <p className="text-xs text-muted-foreground">AIEnterpriseViz</p>
            </div>
          </div>
          <Button onClick={() => setShowAuth(true)} size="lg">
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            AI-Powered Analytics Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Transform Data Into
            <span className="text-primary"> Intelligence</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Enterprise-grade analytics platform with AI-driven insights, multi-tenant architecture, 
            and real-time visualization capabilities.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => setShowAuth(true)}>
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to analyze, visualize, and understand your data
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className={`h-12 w-12 ${feature.color} mb-4`} />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Platform Capabilities</h2>
            <p className="text-muted-foreground text-lg">
              A comprehensive suite of tools for modern data analytics
            </p>
          </div>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {capabilities.map((capability, index) => (
              <div key={index} className="flex items-start gap-3 bg-background p-4 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span>{capability}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise-Ready</h2>
          <p className="text-muted-foreground text-lg">
            Built for scale, security, and performance
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle>Secure</CardTitle>
              <CardDescription>
                Multi-tenant isolation with enterprise-grade security
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <Lock className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <CardTitle>RBAC</CardTitle>
              <CardDescription>
                Granular role-based access control for all users
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <Globe className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <CardTitle>Scalable</CardTitle>
              <CardDescription>
                Handle millions of data points with ease
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <MessageSquare className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <CardTitle>AI Chat</CardTitle>
              <CardDescription>
                Natural language queries powered by AI
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Data?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of companies using AIEnterpriseViz for data analytics
          </p>
          <Button size="lg" variant="secondary" onClick={() => setShowAuth(true)}>
            Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="h-6 w-6" />
            <span className="font-semibold">ABEtworks AIEnterpriseViz</span>
          </div>
          <p>© 2024 ABEtworks. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
