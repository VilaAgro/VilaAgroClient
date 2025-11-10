# Módulo de Frequência, Faltas e Justificativas

## Visão Geral

Este módulo gerencia o controle de presença dos comerciantes na feira, permitindo:
- **Admin**: Registrar faltas, visualizar e aprovar/reprovar justificativas
- **Comerciante**: Visualizar seu histórico, enviar justificativas e notificar ausências futuras

## Tipos de Ausência

O sistema trabalha com dois tipos de ausência:

- **REGISTERED**: Falta registrada pelo admin após o fato (comerciante faltou sem avisar)
- **NOTIFIED**: Ausência notificada antecipadamente pelo comerciante

## Fluxo de Funcionamento

### Fluxo 1: Falta Registrada pelo Admin
1. Admin registra falta de um ou mais comerciantes em uma data específica
2. Comerciante visualiza a falta em seu histórico
3. Comerciante envia justificativa (com ou sem anexo)
4. Admin revisa e aprova/reprova a justificativa
5. Falta é marcada como justificada ou injustificada

### Fluxo 2: Ausência Notificada pelo Comerciante
1. Comerciante notifica que faltará em uma data futura
2. Sistema registra a ausência como NOTIFIED
3. Automaticamente cria uma justificativa (motivo fornecido)
4. Admin pode revisar e aprovar/reprovar a justificativa

---

## Endpoints da API

### 📍 Base URL
```
/api/attendance
```

---

## 1. Admin: Listar Todas as Faltas

Lista todas as faltas de todos os usuários cadastrados.

**Endpoint:** `GET /api/attendance/absences`  
**Permissão:** `ADMIN`  
**Content-Type:** `application/json`

### Response (200 OK)
```json
[
  {
    "id": "323e4567-e89b-12d3-a456-426614174002",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "userName": "João da Silva",
    "date": "2025-01-15",
    "type": "REGISTERED",
    "isAccepted": false,
    "justification": null,
    "createdAt": "2025-01-15T08:30:00",
    "updatedAt": "2025-01-15T08:30:00"
  },
  {
    "id": "423e4567-e89b-12d3-a456-426614174003",
    "userId": "223e4567-e89b-12d3-a456-426614174001",
    "userName": "Maria Santos",
    "date": "2025-01-15",
    "type": "NOTIFIED",
    "isAccepted": true,
    "justification": {
      "id": "523e4567-e89b-12d3-a456-426614174004",
      "description": "Consulta médica",
      "hasAnnex": true,
      "isApproved": true,
      "approvedByAdminId": "623e4567-e89b-12d3-a456-426614174005",
      "createdAt": "2025-01-14T10:00:00",
      "reviewedAt": "2025-01-15T09:00:00"
    },
    "createdAt": "2025-01-14T10:00:00",
    "updatedAt": "2025-01-15T09:00:00"
  }
]
```

### Exemplo cURL
```bash
curl -X GET http://localhost:8080/api/attendance/absences \
  -H "Cookie: accessToken=seu_token_aqui"
```

### Exemplo Insomnia/Postman
```
Method: GET
URL: http://localhost:8080/api/attendance/absences
Headers:
  (cookies automáticos)
```

---

## 2. Admin: Registrar Faltas

Registra faltas para um ou mais usuários em uma data específica.

**Endpoint:** `POST /api/attendance/absences`  
**Permissão:** `ADMIN`  
**Content-Type:** `application/json`

### Request Body
```json
{
  "date": "2025-01-15",
  "userIds": [
    "123e4567-e89b-12d3-a456-426614174000",
    "223e4567-e89b-12d3-a456-426614174001"
  ]
}
```

### Response (201 Created)
```json
[
  {
    "id": "323e4567-e89b-12d3-a456-426614174002",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "userName": "João da Silva",
    "date": "2025-01-15",
    "type": "REGISTERED",
    "isAccepted": false,
    "justification": null,
    "createdAt": "2025-01-15T08:30:00",
    "updatedAt": "2025-01-15T08:30:00"
  },
  {
    "id": "423e4567-e89b-12d3-a456-426614174003",
    "userId": "223e4567-e89b-12d3-a456-426614174001",
    "userName": "Maria Santos",
    "date": "2025-01-15",
    "type": "REGISTERED",
    "isAccepted": false,
    "justification": null,
    "createdAt": "2025-01-15T08:30:00",
    "updatedAt": "2025-01-15T08:30:00"
  }
]
```

### Exemplo cURL
```bash
curl -X POST http://localhost:8080/api/attendance/absences \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=seu_token_aqui" \
  -d '{
    "date": "2025-01-15",
    "userIds": ["123e4567-e89b-12d3-a456-426614174000"]
  }'
```

### Exemplo Insomnia/Postman
```
Method: POST
URL: http://localhost:8080/api/attendance/absences
Headers:
  Content-Type: application/json
Body (JSON):
{
  "date": "2025-01-15",
  "userIds": ["123e4567-e89b-12d3-a456-426614174000"]
}
```

---

## 2. Comerciante: Visualizar Minhas Faltas

Lista todas as faltas do comerciante autenticado.

**Endpoint:** `GET /api/attendance/absences/me`  
**Permissão:** `Autenticado`  
**Content-Type:** `application/json`

### Response (200 OK)
```json
[
  {
    "id": "323e4567-e89b-12d3-a456-426614174002",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "userName": "João da Silva",
    "date": "2025-01-15",
    "type": "REGISTERED",
    "isAccepted": false,
    "justification": null,
    "createdAt": "2025-01-15T08:30:00",
    "updatedAt": "2025-01-15T08:30:00"
  },
  {
    "id": "423e4567-e89b-12d3-a456-426614174003",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "userName": "João da Silva",
    "date": "2025-01-10",
    "type": "NOTIFIED",
    "isAccepted": true,
    "justification": {
      "id": "523e4567-e89b-12d3-a456-426614174004",
      "description": "Consulta médica",
      "hasAnnex": true,
      "isApproved": true,
      "approvedByAdminId": "623e4567-e89b-12d3-a456-426614174005",
      "createdAt": "2025-01-09T14:00:00",
      "reviewedAt": "2025-01-10T09:00:00"
    },
    "createdAt": "2025-01-09T14:00:00",
    "updatedAt": "2025-01-10T09:00:00"
  }
]
```

### Exemplo cURL
```bash
curl -X GET http://localhost:8080/api/attendance/absences/me \
  -H "Cookie: accessToken=seu_token_aqui"
```

---

## 3. Comerciante: Enviar Justificativa

Envia uma justificativa para uma falta específica, com anexo opcional.

**Endpoint:** `POST /api/attendance/absences/{id}/justify`  
**Permissão:** `Autenticado (dono da falta)`  
**Content-Type:** `multipart/form-data`

### Request (Form Data)
```
description: "Estava doente com gripe forte e febre alta"
file: [arquivo PDF/imagem - OPCIONAL]
```

### Response (201 Created)
```json
{
  "id": "723e4567-e89b-12d3-a456-426614174006",
  "description": "Estava doente com gripe forte e febre alta",
  "hasAnnex": true,
  "isApproved": null,
  "approvedByAdminId": null,
  "createdAt": "2025-01-15T10:30:00",
  "reviewedAt": null
}
```

### Exemplo cURL
```bash
curl -X POST http://localhost:8080/api/attendance/absences/323e4567-e89b-12d3-a456-426614174002/justify \
  -H "Cookie: accessToken=seu_token_aqui" \
  -F "description=Estava doente com gripe forte" \
  -F "file=@/caminho/para/atestado.pdf"
```

### Exemplo Insomnia/Postman
```
Method: POST
URL: http://localhost:8080/api/attendance/absences/{absenceId}/justify
Headers:
  (cookies automáticos)
Body (Multipart Form):
  description: "Estava doente com gripe forte"
  file: [selecione o arquivo]
```

---

## 4. Admin: Listar Justificativas Pendentes

Lista todas as justificativas aguardando análise.

**Endpoint:** `GET /api/attendance/justifications/pending`  
**Permissão:** `ADMIN`  
**Content-Type:** `application/json`

### Response (200 OK)
```json
[
  {
    "id": "323e4567-e89b-12d3-a456-426614174002",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "userName": "João da Silva",
    "date": "2025-01-15",
    "type": "REGISTERED",
    "isAccepted": false,
    "justification": {
      "id": "723e4567-e89b-12d3-a456-426614174006",
      "description": "Estava doente com gripe forte",
      "hasAnnex": true,
      "isApproved": null,
      "approvedByAdminId": null,
      "createdAt": "2025-01-15T10:30:00",
      "reviewedAt": null
    },
    "createdAt": "2025-01-15T08:30:00",
    "updatedAt": "2025-01-15T10:30:00"
  }
]
```

### Exemplo cURL
```bash
curl -X GET http://localhost:8080/api/attendance/justifications/pending \
  -H "Cookie: accessToken=seu_token_aqui"
```

---

## 5. Admin: Aprovar/Reprovar Justificativa

Revisa uma justificativa pendente.

**Endpoint:** `PUT /api/attendance/justifications/{id}/review`  
**Permissão:** `ADMIN`  
**Content-Type:** `application/json`

### Request Body (Aprovação)
```json
{
  "isApproved": true,
  "reason": null
}
```

### Request Body (Reprovação)
```json
{
  "isApproved": false,
  "reason": "Atestado médico sem CRM válido"
}
```

### Response (200 OK)
```json
{
  "id": "323e4567-e89b-12d3-a456-426614174002",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "userName": "João da Silva",
  "date": "2025-01-15",
  "type": "REGISTERED",
  "isAccepted": true,
  "justification": {
    "id": "723e4567-e89b-12d3-a456-426614174006",
    "description": "Estava doente com gripe forte",
    "hasAnnex": true,
    "isApproved": true,
    "approvedByAdminId": "623e4567-e89b-12d3-a456-426614174005",
    "createdAt": "2025-01-15T10:30:00",
    "reviewedAt": "2025-01-15T14:00:00"
  },
  "createdAt": "2025-01-15T08:30:00",
  "updatedAt": "2025-01-15T14:00:00"
}
```

### Exemplo cURL (Aprovação)
```bash
curl -X PUT http://localhost:8080/api/attendance/justifications/723e4567-e89b-12d3-a456-426614174006/review \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=seu_token_aqui" \
  -d '{
    "isApproved": true
  }'
```

### Exemplo cURL (Reprovação)
```bash
curl -X PUT http://localhost:8080/api/attendance/justifications/723e4567-e89b-12d3-a456-426614174006/review \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=seu_token_aqui" \
  -d '{
    "isApproved": false,
    "reason": "Documento inválido"
  }'
```

---

## 6. Baixar Anexo de Justificativa

Baixa o arquivo anexado a uma justificativa.

**Endpoint:** `GET /api/attendance/justifications/{id}/annex`  
**Permissão:** `ADMIN ou Dono da justificativa`  
**Response Type:** `application/octet-stream`

### Response
Retorna o arquivo binário para download.

### Exemplo cURL
```bash
curl -X GET http://localhost:8080/api/attendance/justifications/723e4567-e89b-12d3-a456-426614174006/annex \
  -H "Cookie: accessToken=seu_token_aqui" \
  -o anexo.pdf
```

### Exemplo Insomnia/Postman
```
Method: GET
URL: http://localhost:8080/api/attendance/justifications/{justificationId}/annex
Headers:
  (cookies automáticos)
Send and Download
```

---

## 7. Comerciante: Notificar Ausência Futura

Notifica ao sistema que faltará em uma data futura.

**Endpoint:** `POST /api/attendance/absence/notify`  
**Permissão:** `Autenticado`  
**Content-Type:** `multipart/form-data`

### Request (Form Data)
```
date: "2025-01-20"
reason: "Viagem para resolver assuntos familiares"
file: [arquivo opcional]
```

### Response (201 Created)
```json
{
  "id": "823e4567-e89b-12d3-a456-426614174007",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "userName": "João da Silva",
  "date": "2025-01-20",
  "type": "NOTIFIED",
  "isAccepted": false,
  "justification": {
    "id": "923e4567-e89b-12d3-a456-426614174008",
    "description": "Viagem para resolver assuntos familiares",
    "hasAnnex": false,
    "isApproved": null,
    "approvedByAdminId": null,
    "createdAt": "2025-01-15T16:00:00",
    "reviewedAt": null
  },
  "createdAt": "2025-01-15T16:00:00",
  "updatedAt": "2025-01-15T16:00:00"
}
```

### Exemplo cURL
```bash
curl -X POST http://localhost:8080/api/attendance/absence/notify \
  -H "Cookie: accessToken=seu_token_aqui" \
  -F "date=2025-01-20" \
  -F "reason=Viagem para resolver assuntos familiares" \
  -F "file=@/caminho/para/comprovante.pdf"
```

### Exemplo Insomnia/Postman
```
Method: POST
URL: http://localhost:8080/api/attendance/absence/notify
Headers:
  (cookies automáticos)
Body (Multipart Form):
  date: "2025-01-20"
  reason: "Viagem para resolver assuntos familiares"
  file: [selecione o arquivo - OPCIONAL]
```

---

## 8. Comerciante: Resumo de Frequência

Obtém um resumo estatístico da frequência do comerciante.

**Endpoint:** `GET /api/attendance/summary`  
**Permissão:** `Autenticado`  
**Content-Type:** `application/json`

### Response (200 OK)
```json
{
  "totalAbsences": 8,
  "justifiedAbsences": 5,
  "pendingJustifications": 1,
  "unjustifiedAbsences": 2,
  "consecutiveAbsences": 0,
  "isCompliant": true
}
```

### Campos do Resumo
- **totalAbsences**: Total de faltas registradas
- **justifiedAbsences**: Faltas com justificativa aprovada
- **pendingJustifications**: Faltas com justificativa aguardando análise
- **unjustifiedAbsences**: Faltas sem justificativa ou reprovadas
- **consecutiveAbsences**: Número de faltas consecutivas não justificadas
- **isCompliant**: Se está em conformidade (< 3 faltas consecutivas E < 6 faltas injustificadas no ano)

### Exemplo cURL
```bash
curl -X GET http://localhost:8080/api/attendance/summary \
  -H "Cookie: accessToken=seu_token_aqui"
```

---

## 9. Admin: Visualizar Faltas de Usuário Específico

Lista todas as faltas de um comerciante específico.

**Endpoint:** `GET /api/attendance/absences/user/{userId}`  
**Permissão:** `ADMIN`  
**Content-Type:** `application/json`

### Response (200 OK)
```json
[
  {
    "id": "323e4567-e89b-12d3-a456-426614174002",
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "userName": "João da Silva",
    "date": "2025-01-15",
    "type": "REGISTERED",
    "isAccepted": true,
    "justification": {
      "id": "723e4567-e89b-12d3-a456-426614174006",
      "description": "Estava doente com gripe forte",
      "hasAnnex": true,
      "isApproved": true,
      "approvedByAdminId": "623e4567-e89b-12d3-a456-426614174005",
      "createdAt": "2025-01-15T10:30:00",
      "reviewedAt": "2025-01-15T14:00:00"
    },
    "createdAt": "2025-01-15T08:30:00",
    "updatedAt": "2025-01-15T14:00:00"
  }
]
```

### Exemplo cURL
```bash
curl -X GET http://localhost:8080/api/attendance/absences/user/123e4567-e89b-12d3-a456-426614174000 \
  -H "Cookie: accessToken=seu_token_aqui"
```

---

## Regras de Negócio

### 1. Registro de Faltas
- ✅ Admin pode registrar faltas apenas para usuários com status `ACTIVE`
- ✅ Não permite duplicatas (mesma data + mesmo usuário)
- ✅ Faltas são criadas com `isAccepted = false` por padrão

### 2. Justificativas
- ✅ Apenas o dono da falta pode enviar justificativa
- ✅ Não é possível enviar justificativa duplicada para a mesma falta
- ✅ Anexos são opcionais
- ✅ Justificativas ficam pendentes (`isApproved = null`) até revisão do admin

### 3. Revisão de Justificativas
- ✅ Apenas admin pode aprovar/reprovar
- ✅ Aprovação altera `isAccepted` da falta para `true`
- ✅ Reprovação mantém `isAccepted` como `false`
- ✅ Registra ID do admin que fez a revisão

### 4. Notificação de Ausência
- ✅ Comerciante pode notificar ausências futuras
- ✅ Sistema cria automaticamente a falta com tipo `NOTIFIED`
- ✅ Cria justificativa automática que precisa ser aprovada pelo admin
- ✅ Não permite notificar data que já tem falta registrada

### 5. Conformidade
- ✅ Comerciante é considerado **não conforme** se:
  - Tiver 3 ou mais faltas consecutivas não justificadas, **OU**
  - Tiver 6 ou mais faltas injustificadas no ano

---

## Códigos de Status HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Não autenticado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 500 | Internal Server Error - Erro no servidor |

---

## Exemplos de Cenários Completos

### Cenário 1: Comerciante Falta e Justifica

1. **Admin registra falta** (15/01)
```bash
POST /api/attendance/absences
{
  "date": "2025-01-15",
  "userIds": ["123e4567-e89b-12d3-a456-426614174000"]
}
```

2. **Comerciante visualiza suas faltas**
```bash
GET /api/attendance/absences/me
```

3. **Comerciante envia justificativa com atestado**
```bash
POST /api/attendance/absences/{absenceId}/justify
Form Data:
  description: "Estava doente"
  file: atestado.pdf
```

4. **Admin lista justificativas pendentes**
```bash
GET /api/attendance/justifications/pending
```

5. **Admin aprova justificativa**
```bash
PUT /api/attendance/justifications/{justificationId}/review
{
  "isApproved": true
}
```

### Cenário 2: Comerciante Notifica Ausência Futura

1. **Comerciante notifica que faltará** (20/01)
```bash
POST /api/attendance/absence/notify
Form Data:
  date: "2025-01-20"
  reason: "Consulta médica agendada"
  file: comprovante.pdf
```

2. **Sistema cria falta tipo NOTIFIED + justificativa automática**

3. **Admin revisa e aprova a notificação**
```bash
PUT /api/attendance/justifications/{justificationId}/review
{
  "isApproved": true
}
```

### Cenário 3: Verificar Conformidade

**Comerciante verifica seu resumo**
```bash
GET /api/attendance/summary
```

**Resposta:**
```json
{
  "totalAbsences": 8,
  "justifiedAbsences": 6,
  "pendingJustifications": 0,
  "unjustifiedAbsences": 2,
  "consecutiveAbsences": 0,
  "isCompliant": true
}
```

---

## Autenticação

Todas as requisições requerem autenticação via cookie JWT.

### Como obter o token
1. Faça login:
```bash
POST /api/auth/login
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

2. O token será retornado em um cookie `accessToken`

3. Use esse cookie nas requisições subsequentes

### No Insomnia/Postman
- O cookie é gerenciado automaticamente após o login
- Certifique-se de que "Automatically manage cookies" está habilitado

---

## Tratamento de Erros

### Erro: Falta já existe para esta data
```json
{
  "status": 400,
  "message": "Já existe uma falta registrada ou notificada para esta data."
}
```

### Erro: Usuário não tem permissão
```json
{
  "status": 403,
  "message": "Você não tem permissão para justificar esta ausência."
}
```

### Erro: Justificativa já existe
```json
{
  "status": 400,
  "message": "Esta ausência já possui uma justificativa."
}
```

### Erro: Anexo não encontrado
```json
{
  "status": 404,
  "message": "Justificativa não encontrada (Anexo não encontrado)"
}
```

---

## Observações Importantes

1. **Anexos**: São armazenados como `BLOB` no banco de dados
2. **Datas**: Use formato ISO-8601 (`YYYY-MM-DD`)
3. **UUIDs**: Todos os IDs são UUIDs v4
4. **Cookies**: Sistema usa cookies HTTP-only para JWT
5. **CORS**: Configure adequadamente para o frontend

---

## Links Relacionados

- Módulo de Autenticação: Ver documentação de Auth
- Gestão de Usuários: Ver documentação de Users
- Requisições de Exemplo: Ver `EXEMPLOS_REQUISICOES.md`

---

**Versão:** 1.0  
**Última Atualização:** 2025-01-15
