import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Plus, Settings2, BarChart3, Cpu } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";

type Customer = {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
};

type User = {
  id: string;
  customerId: string | null;
  email: string;
  username: string;
  role: string;
  status: string;
  lastLoginAt?: string;
  createdAt: string;
};

type LlmProvider = {
  id: string;
  name: string;
  type: string;
  baseUrl?: string;
  defaultModel?: string;
  isActive: boolean;
  createdAt: string;
};

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);

  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    name: "",
    slug: "",
    status: "active",
  });

  // User form state
  const [userForm, setUserForm] = useState({
    email: "",
    username: "",
    password: "",
    role: "viewer",
    customerId: "",
  });

  // Fetch customers
  const { data: customers = [], isLoading: loadingCustomers } = useQuery<Customer[]>({
    queryKey: ["/api/admin/customers"],
    enabled: user?.role === "super_admin",
  });

  // Fetch users
  const { data: users = [], isLoading: loadingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: user?.role === "super_admin" || user?.role === "customer_admin",
  });

  // Fetch LLM providers
  const { data: llmProviders = [], isLoading: loadingProviders } = useQuery<LlmProvider[]>({
    queryKey: ["/api/llm-providers"],
  });

  // Create customer mutation
  const createCustomer = useMutation({
    mutationFn: async (data: typeof customerForm) => {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customers"] });
      setCustomerDialogOpen(false);
      setCustomerForm({ name: "", slug: "", status: "active" });
      toast({ title: "Customer created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Create user mutation
  const createUser = useMutation({
    mutationFn: async (data: typeof userForm) => {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setUserDialogOpen(false);
      setUserForm({ email: "", username: "", password: "", role: "viewer", customerId: "" });
      toast({ title: "User created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update customer status
  const updateCustomerStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customers"] });
      toast({ title: "Customer updated successfully" });
    },
  });

  // Update user status
  const updateUserStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated successfully" });
    },
  });

  if (user?.role !== "super_admin" && user?.role !== "customer_admin") {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardHeader>
            <CardTitle data-testid="text-access-denied-title">Access Denied</CardTitle>
            <CardDescription data-testid="text-access-denied-description">
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const activeCustomers = customers.filter(c => c.status === "active").length;
  const activeUsers = users.filter(u => u.status === "active").length;
  const activeProviders = llmProviders.filter(p => p.isActive).length;

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" data-testid="text-page-title">Admin Panel</h1>
          <p className="text-sm sm:text-base text-muted-foreground" data-testid="text-page-description">
            Manage customers, users, and system settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full" data-testid="tabs-admin">
        <TabsList data-testid="tablist-admin">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="customers" disabled={user?.role !== "super_admin"} data-testid="tab-customers">
            <Building2 className="h-4 w-4 mr-2" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="providers" data-testid="tab-providers">
            <Cpu className="h-4 w-4 mr-2" />
            AI Providers
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4" data-testid="content-overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card data-testid="card-total-customers">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-customers">{customers.length}</div>
                <p className="text-xs text-muted-foreground" data-testid="text-active-customers">
                  {activeCustomers} active
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-total-users">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-users">{users.length}</div>
                <p className="text-xs text-muted-foreground" data-testid="text-active-users">
                  {activeUsers} active
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-ai-providers">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Providers</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-providers">{llmProviders.length}</div>
                <p className="text-xs text-muted-foreground" data-testid="text-active-providers">
                  {activeProviders} active
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-system-status">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Settings2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="text-system-status">Online</div>
                <p className="text-xs text-muted-foreground" data-testid="text-system-uptime">
                  All systems operational
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card data-testid="card-recent-customers">
              <CardHeader>
                <CardTitle>Recent Customers</CardTitle>
                <CardDescription>Latest customer registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customers.slice(0, 5).map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between" data-testid={`item-customer-${customer.id}`}>
                      <div>
                        <p className="text-sm font-medium" data-testid={`text-customer-name-${customer.id}`}>{customer.name}</p>
                        <p className="text-xs text-muted-foreground" data-testid={`text-customer-slug-${customer.id}`}>{customer.slug}</p>
                      </div>
                      <Badge variant={customer.status === "active" ? "default" : "secondary"} data-testid={`badge-customer-status-${customer.id}`}>
                        {customer.status}
                      </Badge>
                    </div>
                  ))}
                  {customers.length === 0 && (
                    <p className="text-sm text-muted-foreground" data-testid="text-no-customers">No customers yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-recent-users">
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.slice(0, 5).map((u) => (
                    <div key={u.id} className="flex items-center justify-between" data-testid={`item-user-${u.id}`}>
                      <div>
                        <p className="text-sm font-medium" data-testid={`text-user-username-${u.id}`}>{u.username}</p>
                        <p className="text-xs text-muted-foreground" data-testid={`text-user-email-${u.id}`}>{u.email}</p>
                      </div>
                      <Badge data-testid={`badge-user-role-${u.id}`}>{u.role.replace('_', ' ')}</Badge>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <p className="text-sm text-muted-foreground" data-testid="text-no-users">No users yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4" data-testid="content-customers">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold" data-testid="text-customers-title">Customer Management</h2>
            <Dialog open={customerDialogOpen} onOpenChange={setCustomerDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-customer">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle data-testid="text-dialog-title">Create New Customer</DialogTitle>
                  <DialogDescription data-testid="text-dialog-description">
                    Add a new customer organization to the platform
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Customer Name</Label>
                    <Input
                      id="name"
                      data-testid="input-customer-name"
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (URL identifier)</Label>
                    <Input
                      id="slug"
                      data-testid="input-customer-slug"
                      value={customerForm.slug}
                      onChange={(e) => setCustomerForm({ ...customerForm, slug: e.target.value })}
                      placeholder="acme-corp"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCustomerDialogOpen(false)} data-testid="button-cancel-customer">
                    Cancel
                  </Button>
                  <Button onClick={() => createCustomer.mutate(customerForm)} disabled={createCustomer.isPending} data-testid="button-create-customer">
                    Create Customer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card data-testid="card-customers-table">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Name</TableHead>
                      <TableHead className="whitespace-nowrap">Slug</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap">Created</TableHead>
                      <TableHead className="whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingCustomers ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center" data-testid="text-loading-customers">Loading...</TableCell>
                      </TableRow>
                    ) : customers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center" data-testid="text-no-customers-table">No customers found</TableCell>
                      </TableRow>
                    ) : (
                      customers.map((customer) => (
                        <TableRow key={customer.id} data-testid={`row-customer-${customer.id}`}>
                          <TableCell className="font-medium whitespace-nowrap" data-testid={`cell-customer-name-${customer.id}`}>
                            {customer.name}
                          </TableCell>
                          <TableCell className="whitespace-nowrap" data-testid={`cell-customer-slug-${customer.id}`}>
                            {customer.slug}
                          </TableCell>
                          <TableCell data-testid={`cell-customer-status-${customer.id}`}>
                            <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                              {customer.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap" data-testid={`cell-customer-created-${customer.id}`}>
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={customer.status}
                              onValueChange={(status) => updateCustomerStatus.mutate({ id: customer.id, status })}
                              data-testid={`select-customer-status-${customer.id}`}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4" data-testid="content-users">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold" data-testid="text-users-title">User Management</h2>
            <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-user">
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle data-testid="text-dialog-user-title">Create New User</DialogTitle>
                  <DialogDescription data-testid="text-dialog-user-description">
                    Add a new user to the platform
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      data-testid="input-user-email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      data-testid="input-user-username"
                      value={userForm.username}
                      onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                      placeholder="johndoe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      data-testid="input-user-password"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                  {user?.role === "super_admin" && (
                    <div className="space-y-2">
                      <Label htmlFor="customer">Customer</Label>
                      <Select
                        value={userForm.customerId || undefined}
                        onValueChange={(v) => setUserForm({ ...userForm, customerId: v })}
                        data-testid="select-user-customer"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={userForm.role}
                      onValueChange={(v) => setUserForm({ ...userForm, role: v })}
                      data-testid="select-user-role"
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {user?.role === "super_admin" && <SelectItem value="super_admin">Super Admin</SelectItem>}
                        <SelectItem value="customer_admin">Customer Admin</SelectItem>
                        <SelectItem value="analyst">Analyst</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setUserDialogOpen(false)} data-testid="button-cancel-user">
                    Cancel
                  </Button>
                  <Button onClick={() => createUser.mutate(userForm)} disabled={createUser.isPending} data-testid="button-create-user">
                    Create User
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card data-testid="card-users-table">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Username</TableHead>
                      <TableHead className="whitespace-nowrap">Email</TableHead>
                      <TableHead className="whitespace-nowrap">Role</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap">Last Login</TableHead>
                      <TableHead className="whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingUsers ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center" data-testid="text-loading-users">Loading...</TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center" data-testid="text-no-users-table">No users found</TableCell>
                      </TableRow>
                    ) : (
                      users.map((u) => (
                        <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                          <TableCell className="font-medium whitespace-nowrap" data-testid={`cell-user-username-${u.id}`}>
                            {u.username}
                          </TableCell>
                          <TableCell className="whitespace-nowrap" data-testid={`cell-user-email-${u.id}`}>
                            {u.email}
                          </TableCell>
                          <TableCell data-testid={`cell-user-role-${u.id}`}>
                            <Badge>{u.role.replace('_', ' ')}</Badge>
                          </TableCell>
                          <TableCell data-testid={`cell-user-status-${u.id}`}>
                            <Badge variant={u.status === "active" ? "default" : "secondary"}>
                              {u.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap" data-testid={`cell-user-lastlogin-${u.id}`}>
                            {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "Never"}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={u.status}
                              onValueChange={(status) => updateUserStatus.mutate({ id: u.id, status })}
                              data-testid={`select-user-status-${u.id}`}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Providers Tab */}
        <TabsContent value="providers" className="space-y-4" data-testid="content-providers">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold" data-testid="text-providers-title">AI Providers</h2>
          </div>

          <Card data-testid="card-providers-table">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Provider Name</TableHead>
                      <TableHead className="whitespace-nowrap">Type</TableHead>
                      <TableHead className="whitespace-nowrap">Default Model</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingProviders ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center" data-testid="text-loading-providers">Loading...</TableCell>
                      </TableRow>
                    ) : llmProviders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center" data-testid="text-no-providers">No providers found</TableCell>
                      </TableRow>
                    ) : (
                      llmProviders.map((provider) => (
                        <TableRow key={provider.id} data-testid={`row-provider-${provider.id}`}>
                          <TableCell className="font-medium whitespace-nowrap" data-testid={`cell-provider-name-${provider.id}`}>
                            {provider.name}
                          </TableCell>
                          <TableCell className="whitespace-nowrap" data-testid={`cell-provider-type-${provider.id}`}>
                            {provider.type}
                          </TableCell>
                          <TableCell className="whitespace-nowrap" data-testid={`cell-provider-model-${provider.id}`}>
                            {provider.defaultModel || "N/A"}
                          </TableCell>
                          <TableCell data-testid={`cell-provider-status-${provider.id}`}>
                            <Badge variant={provider.isActive ? "default" : "secondary"}>
                              {provider.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap" data-testid={`cell-provider-created-${provider.id}`}>
                            {new Date(provider.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-provider-info">
            <CardHeader>
              <CardTitle>Provider Configuration</CardTitle>
              <CardDescription>
                AI providers can be configured per customer in the AI Settings page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Navigate to the AI Settings page to configure API keys and model preferences for each customer.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
