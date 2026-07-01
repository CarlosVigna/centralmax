# ADR 002 — Upload de Fotos: Local vs. S3

## Contexto

O módulo de gestão de produtos precisa suportar upload de fotos. Precisamos decidir onde armazenar os arquivos enviados pelo administrador.

## Opções consideradas

**A. Armazenamento local (disco do servidor)**
- Arquivos salvos em `/uploads/products/{productId}/{filename}` no disco do backend.
- Servidos via endpoint estático `/uploads/**` (Spring `ResourceHandler`).
- Zero custo adicional de infra enquanto o sistema estiver em servidor único.

**B. Object storage (AWS S3, Cloudflare R2, etc.)**
- Arquivos enviados diretamente para bucket na nuvem.
- URLs públicas permanentes, sem depender do servidor backend.
- Escalável e resiliente; ideal para deploy multi-instância.

## Decisão

**Escolhemos A (armazenamento local)** para a fase atual.

### Motivos

1. O sistema ainda está em fase de desenvolvimento e validação — a empresa ainda não tem volume de produtos que justifique custo de S3.
2. Complexidade de integração com S3 (SDK, IAM, bucket policies, multipart signed URLs) não agrega valor agora.
3. O backend roda em instância única (Railway/Render), então não há problema de sincronização de disco entre instâncias.

## Consequências

- **Positivo:** implementação simples, zero dependência externa.
- **Negativo:** os arquivos **não persistem entre redeploys** se o servidor não tiver volume persistente configurado — isso **deve ser resolvido antes de ir para produção** (configurar um volume persistente no Railway/Render, ou migrar para S3).
- A URL das fotos é `http://<backend-host>/uploads/products/{productId}/{filename}`, o que expõe o host do backend — aceitável no estágio atual.

## Migração futura para S3

Quando o volume de produtos ou o deploy multi-região exigir:
1. Criar bucket (S3 ou R2) e configurar política pública de leitura.
2. Substituir `ProductPhotoService.upload()` para enviar para o bucket via SDK.
3. A URL retornada passa a ser a URL do bucket (ex: `https://cdn.centralmax.com.br/...`).
4. Migrar os arquivos existentes com `aws s3 sync /uploads s3://bucket`.
5. Remover `WebMvcConfig` do ResourceHandler local.

O campo `url` na tabela `product_photos` já armazena a URL completa — não há necessidade de migration de schema na troca de storage.
