# Admin API Reference

## Autenticación

Todas las rutas requieren un usuario con `role: "ADMIN"` en la base de datos.

Obtén el token de sesión desde las cookies del navegador después de iniciar sesión.

```bash
# Header de autenticación
-H "Cookie: better-auth.session_token=TU_TOKEN"
```

### Hacer admin a un usuario

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'tu-email@ejemplo.com';
```

---

## Productos

### Listar productos

```bash
curl -X GET "http://localhost:3000/api/admin/products" \
  -H "Cookie: better-auth.session_token=TU_TOKEN"
```

### Crear producto

```bash
curl -X POST "http://localhost:3000/api/admin/products" \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=TU_TOKEN" \
  -d '{
    "name": "Camiseta Premium",
    "description": "Una camiseta de alta calidad",
    "summary": "Algodón 100%",
    "images": ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
    "variants": [
      {
        "price": "2999",
        "currency": "USD",
        "options": [
          {"key": "size", "label": "Size", "value": "M", "type": "string"},
          {"key": "color", "label": "Color", "value": "Rojo", "type": "color", "colorValue": "#FF0000"}
        ]
      },
      {
        "price": "2999",
        "currency": "USD",
        "options": [
          {"key": "size", "label": "Size", "value": "L", "type": "string"},
          {"key": "color", "label": "Color", "value": "Azul", "type": "color", "colorValue": "#0000FF"}
        ]
      }
    ]
  }'
```

### Obtener producto

```bash
curl -X GET "http://localhost:3000/api/admin/products/PRODUCT_ID" \
  -H "Cookie: better-auth.session_token=TU_TOKEN"
```

### Actualizar producto

```bash
curl -X PATCH "http://localhost:3000/api/admin/products/PRODUCT_ID" \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=TU_TOKEN" \
  -d '{
    "name": "Camiseta Premium V2",
    "description": "Descripción actualizada",
    "images": ["https://example.com/new-img.jpg"],
    "active": true
  }'
```

### Eliminar producto (soft delete)

```bash
curl -X DELETE "http://localhost:3000/api/admin/products/PRODUCT_ID" \
  -H "Cookie: better-auth.session_token=TU_TOKEN"
```

---

## Variantes

### Crear variante

```bash
curl -X POST "http://localhost:3000/api/admin/products/PRODUCT_ID/variants" \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=TU_TOKEN" \
  -d '{
    "price": "3499",
    "currency": "USD",
    "images": ["https://example.com/variant-img.jpg"],
    "options": [
      {"key": "size", "label": "Size", "value": "XL", "type": "string"}
    ],
    "active": true
  }'
```

### Actualizar variante

```bash
curl -X PATCH "http://localhost:3000/api/admin/variants/VARIANT_ID" \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=TU_TOKEN" \
  -d '{
    "price": "3999",
    "currency": "USD",
    "active": true
  }'
```

### Eliminar variante (soft delete)

```bash
curl -X DELETE "http://localhost:3000/api/admin/variants/VARIANT_ID" \
  -H "Cookie: better-auth.session_token=TU_TOKEN"
```

---

## Colecciones

### Listar colecciones

```bash
curl -X GET "http://localhost:3000/api/admin/collections" \
  -H "Cookie: better-auth.session_token=TU_TOKEN"
```

### Crear colección

```bash
curl -X POST "http://localhost:3000/api/admin/collections" \
  -H "Content-Type: application/json" \
  -H "Cookie: better-auth.session_token=TU_TOKEN" \
  -d '{
    "name": "Verano 2025",
    "description": "Colección de temporada",
    "image": "https://example.com/collection.jpg"
  }'
```

---

## Referencia de Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `price` | `string` | Precio en **centavos** (ej: `"2999"` = $29.99) |
| `currency` | `string` | Código ISO 4217 (ej: `"USD"`, `"EUR"`, `"MXN"`) |
| `options[].type` | `string` | `"string"` o `"color"` |
| `options[].colorValue` | `string` | Hex color, solo si `type: "color"` |
| `active` | `boolean` | Si el producto/variante está activo |

## Respuestas

### Éxito

```json
{
  "data": { ... },
  "syncStatus": "synced",
  "syncError": null
}
```

### Error

```json
{
  "error": "Mensaje de error"
}
```

### Códigos HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK |
| 201 | Creado |
| 400 | Bad Request (validación) |
| 401 | No autenticado |
| 403 | No autorizado (no es admin) |
| 404 | No encontrado |
| 500 | Error interno |
