# Documentación · Sistema de Afiliados

| Documento | Contenido |
| --------- | --------- |
| [SISTEMA_DE_AFILIADOS.md](./SISTEMA_DE_AFILIADOS.md) | Contrato completo de la API: modelo de negocio, esquema de base de datos, endpoints, cálculo de comisiones, atribución de referidos, configuración editable y ejemplos cURL |

**Resumen para el equipo de backend:** implementar los endpoints de
`SISTEMA_DE_AFILIADOS.md` §3, la lógica de comisiones de §4 (3% nivel 1,
2% nivel 2 por defecto, configurable vía `PUT /web/admin/affiliate-settings`)
y la atribución de referidos de §5. El frontend ya consume este contrato.

**Resumen para producto:** el flujo visible es

1. Landing pública `/afiliados` → registro multi-paso `/afiliados/registro`.
2. Panel del afiliado `/affiliate/*` (red de 2 niveles, comisiones, retiros).
3. Admin `/admin/affiliates` (aprobar afiliados) y
   `/admin/affiliates/settings` (porcentajes y reglas).
