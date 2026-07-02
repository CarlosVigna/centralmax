# ADR 003 — Migração de Upload de Fotos para Cloudflare R2

## Contexto

O ADR 002 escolheu armazenamento local como solução temporária e antecipou esta migração. O armazenamento local não persiste entre redeploys no Railway/Render sem configuração de volume persistente, o que tornaria as fotos de produto inatingíveis em produção.

## Decisão

Migrar o storage de fotos de produto para **Cloudflare R2** via AWS SDK v2 (S3-compatible API).

### Componentes criados

- `StorageService` (interface): contrato com `upload(MultipartFile, folder)` e `delete(fileUrl)`.
- `R2StorageService` (implementação): usa `S3Client` apontando para o endpoint R2 com path-style access.
- `StorageConfig`: cria o bean `S3Client` com `endpointOverride`, credenciais estáticas e `Region.of("auto")`.

### Configuração

Propriedades em `app.storage.*` no `application.yml`. O `application.yml` não é versionado; o `.example` contém os placeholders.

### Remoções

- `WebMvcConfig.addResourceHandlers` — não serve mais arquivos locais.
- `@Value("${app.upload.dir/base-url}")` em `ProductPhotoService` e `ProductService`.

## Consequências

- **Positivo:** fotos persistem independentemente do servidor; URLs públicas permanentes.
- **Positivo:** compatível com deploy multi-instância futuro.
- **Limitação conhecida — duplicação de produto:** `ProductService.copyPhotos()` cria novos registros no banco apontando para os mesmos objetos R2 do produto original (compartilhados). O `StorageService` não expõe `CopyObject` (fora do escopo desta tarefa). Consequência prática: excluir uma foto do produto original pode tornar a URL da cópia inválida. Quando necessário, adicionar `copy(sourceUrl, destFolder)` à interface e implementar via `S3Client.copyObject()`.
- **Limitação conhecida — bucket público:** o bucket ainda não tem política de leitura pública configurada no dashboard do R2. As URLs geradas podem retornar 403 até que a política seja aplicada. Configuração de domínio público (`pub-*.r2.dev` ou domínio customizado) pendente.
