# Fournos - Sistema de Pedidos

## Sobre o Projeto
O Fournos é um sistema full-stack de gerenciamento de pedidos e operações para padarias. A aplicação foi desenvolvida utilizando Next.js para o frontend e backend (API Routes), com interface estilizada via Tailwind CSS. A persistência de dados é gerenciada pelo Prisma ORM integrado a um banco de dados PostgreSQL.

## Tecnologias Utilizadas
- Next.js 16
- React 19
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Docker & Docker Compose

## Acesso Inicial (Administrador Padrão)
Para facilitar a correção e os testes da aplicação, o banco de dados é populado automaticamente (via seed) durante a inicialização com uma conta de administrador pré-cadastrada.

Utilize as seguintes credenciais para fazer o primeiro login:
- **E-mail:** admin@admin.com
- **Senha:** admin

## Como Executar o Projeto

O projeto está totalmente conteinerizado, o que significa que você não precisa instalar o Node.js ou o PostgreSQL localmente na sua máquina, apenas o Docker.

1. Certifique-se de ter o Docker e o Docker Compose instalados.
2. Clone o repositório para a sua máquina.
3. Navegue até o diretório raiz do projeto.
4. Execute o comando abaixo para construir e iniciar os containers:

docker compose up --build

5. Aguarde a inicialização. O sistema aplicará as migrações do banco de dados e executará o seed do administrador automaticamente.
6. Acesse a aplicação no seu navegador: http://localhost:3000

## Arquitetura Docker (Ambiente de Desenvolvimento)

O ambiente foi configurado utilizando o `docker-compose.yml` e um `Dockerfile` dedicado para simplificar a execução e garantir a paridade de desenvolvimento. Abaixo estão os detalhes técnicos da infraestrutura de containers:

### 1. Serviço Web (Aplicação Next.js)
- **Imagem Base:** Utiliza o `node:20-alpine`, uma imagem leve e otimizada para executar o ambiente Node.js.
- **Portas Expostas:** - `3000`: Para acesso à interface web da aplicação.
  - `9229`: Exposta com a variável de ambiente `--inspect=0.0.0.0:9229` para permitir o anexo de debuggers externos.
- **Gerenciamento de Dependências e Build:** Durante a construção da imagem, o gerenciador de pacotes instala as dependências e o cliente do Prisma é gerado automaticamente.
- **Sincronização de Código:** O uso de volumes (`.:/app`) mapeia o código-fonte local para dentro do container. Isso permite que qualquer alteração no código seja refletida imediatamente no navegador (Hot Module Replacement) sem necessidade de reconstruir a imagem.
- **Inicialização:** O serviço web possui uma dependência estrita (`depends_on: condition: service_healthy`) do banco de dados. Ao iniciar, ele executa um script que primeiro aplica as migrações do Prisma, em seguida popula o banco com o seed e então levanta o servidor de desenvolvimento.

### 2. Serviço DB (Banco de Dados PostgreSQL)
- **Imagem:** Utiliza a imagem oficial `postgres:15-alpine`.
- **Porta:** Exposta na porta padrão `5432`.
- **Configuração:** O banco de dados `fournos_db` é criado automaticamente com credenciais padrão configuradas via variáveis de ambiente.
- **Healthcheck:** Um teste de integridade contínuo (`pg_isready`) verifica se o banco de dados está pronto para aceitar conexões. Isso garante que a aplicação web só tente se conectar quando o PostgreSQL estiver 100% operacional.
- **Persistência de Dados:** O volume nomeado `pgdata` foi configurado para mapear o diretório interno do PostgreSQL. Isso garante que os registros inseridos no sistema não sejam perdidos quando o container for desligado ou reiniciado.