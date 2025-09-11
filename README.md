# Documentação do AuthService

## Visão Geral
O `AuthService` é o serviço central para gerenciamento de autenticação no projeto VilaAgro. Ele utiliza Angular Signals para estado reativo e JWT tokens armazenados em cookies seguros.

## Funcionalidades Principais

### 1. Login e Logout
```typescript
// Login
authService.login({ email: 'user@example.com', password: 'password' })
  .subscribe({
    next: (response) => console.log('Login realizado com sucesso'),
    error: (error) => console.error('Erro no login:', error)
  });

// Logout
authService.logout();

// Logout forçado (sem chamar API)
authService.forceLogout();
```

### 2. Verificação de Estado
```typescript
// Verificar se está logado
const isLoggedIn = authService.isLoggedIn();

// Verificar role
const isAdmin = authService.isAdmin();
const isUser = authService.isUser();
const role = authService.getUserRole();

// Obter usuário atual
const user = authService.getCurrentUser();
```

### 3. Signals Reativos
```typescript
// Em componentes, use signals para reatividade
export class MyComponent {
  private authService = inject(AuthService);
  
  // Acesso reativo ao estado de autenticação
  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser;
  userRole = this.authService.userRole;
  
  // Em templates
  // {{ isAuthenticated() ? 'Logado' : 'Não logado' }}
  // {{ currentUser()?.name }}
}
```

### 4. Guards
```typescript
// No routing, use os guards
{
  path: 'painel',
  canActivate: [authGuard],
  component: UserDashboardComponent
},
{
  path: 'admin',
  canActivate: [adminGuard],
  component: AdminLayoutComponent
}
```

## Segurança

### Armazenamento de Token
- Tokens são armazenados em cookies seguros
- Configurado com `SameSite=Strict` e `Secure=true` em produção
- Expiração automática em 24 horas

### Interceptor JWT
- Adiciona automaticamente o token em todas as requisições para a API
- Configurado no `app.config.ts`

## Estados do Usuário
- `PENDING`: Cadastro em análise
- `APPROVED`: Aprovado, na fila de espera
- `ACTIVE`: Ativo com ponto de venda
- `REJECTED`: Cadastro rejeitado
- `INACTIVE`: Inativo no sistema

## Roles
- `ADMIN`: Administrador (SEAMA)
- `USER`: Comerciante/Usuário comum
