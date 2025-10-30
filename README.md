# Dashboard de Tarefas

Este projeto visa criar um dashboard de tarefas com funcionalidades básicas de gerenciamento com tags e logs.

Neste README podem ser encontrados informações sobre a instalação e execução do projeto, incluindo o que foi feito e o que ainda precisa ser feito.

Você pode ver o dashboard em ação no link: [dashboard-tarefas-test.vercel.app]

## Instalação

Foi utlizado no desenvolvimento o Node.js v22.19.0.

```bash
# Instale as dependências
npm install
# Inicie o servidor de desenvolvimento e abra a URL http://localhost:3000
npm run dev
```

## Componentes

| Componente   | Dependências |
| ------------ | ------------ |
| **Logs**     |              |
| **Login**    | Logs         |
| **Tags**     | Logs         |
| **Tasks**    | Logs, Tags   |
| **Subtasks** | Logs, Tasks  |

## Requisitos Técnicos

- [x] Responsividade (mobile → desktop)
- [x] Acessibilidade básica (labels, navegação por teclado)
- [x] Separação clara entre componentes e gerenciamento de estado
- [x] Persistência dos dados no **localStorage** do navegador.
- [x] **React** + **TypeScript** + **Next.js**
- [x] Gerenciamento de estado global com **Zustand**
- [x] Estilização com **shadcn/ui**, e adicionalmente **Tailwind CSS** caso necessário
- [ ] Tratamento de formulários com **React Hook Form** e **Zod**
- [ ] Testes unitários utilizando **Jest**

**Observações:**

- As interfaces de dados estão no arquivo `src/app/lib/interfaces.ts`.
- O arquivo `src/lib/store.ts` representa o gerenciamento de estado global do dashboard.
- O arquivo `app/page.tsx` ainda pode ser quebrado em componentes menores representando cada uma das funcionalidades do dashboard. Os componentes existes em `src/components` representam apenas peças de interface e não de funcionalidades completas.

## Histórias de Usuário

Abaixo estão as histórias de usuário identificadas.

### 🔒 Login

- [ ] Como usuário, quero fazer login com usuário “admin” e senha ”password”, para acessar minhas tarefas.

### 💻 Tarefas

- [x] Como usuário autenticado, quero **criar uma nova tarefa com título**, descrição, prioridade e status.
- [x] Como usuário, quero **listar minhas tarefas**, separadas por status: pendente, em andamento, concluída.
- [x] Como usuário, quero **editar e excluir tarefas**, para manter minhas informações atualizadas.
- [ ] Como usuário, quero **filtrar e pesquisar minhas tarefas** por status ou título.
- [ ] Como usuário, quero **ordenar minhas tarefas** por prioridade e data de criação.

### 🏷 Tags

- [x] Como usuário, quero **adicionar tags personalizadas às tarefas** (ex: "urgente", "backend", "bug").
- [ ] Como usuário, quero **filtrar tarefas por uma ou múltiplas tags**.
- [ ] Como usuário, quero **criar, editar e excluir tags com cores personalizadas**.
- [ ] Como usuário, quero **ver um contador de tarefas por tag**, para entender minha  
       distribuição de trabalho.

### ✅ Subtarefas (Checklist)

- [ ] Como usuário, quero **adicionar uma lista de subtarefas dentro de cada tarefa**, para quebrar tarefas complexas em passos menores.
- [ ] Como usuário, quero **marcar subtarefas como concluídas independentemente**, para acompanhar meu progresso parcial.
- [ ] Como usuário, quero **ver o progresso visual da tarefa** (ex: "3/5 subtarefas concluídas"), para entender rapidamente o status.
- [ ] Como usuário, quero **que a tarefa principal só possa ser marcada como concluída quando todas as subtarefas estiverem completas**, para garantir que nada seja esquecido.

### 📜 Histórico e Logs de Atividade

- [ ] Como usuário, quero **ver quando cada tarefa foi criada, editada e concluída**, para ter rastreabilidade das minhas ações.
- [ ] Como usuário, quero **visualizar um log de atividades recentes** no dashboard (ex: "Tarefa X foi concluída há 2 horas"), para acompanhar minha produtividade.
- [ ] Como usuário, quero **ver o histórico completo de uma tarefa específica**, para entender sua evolução ao longo do tempo.
