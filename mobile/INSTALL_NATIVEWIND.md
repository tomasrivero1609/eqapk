# Instalación de NativeWind (Tailwind para React Native)

## Pasos para completar la instalación:

1. **Instalar las dependencias:**
```bash
cd mobile
npm install
```

2. **Reiniciar el servidor de Metro:**
```bash
# Detén el servidor actual (Ctrl+C) y reinicia:
npm start -- --clear
```

## ✅ Lo que ya está configurado:

- ✅ `tailwind.config.js` - Configuración de Tailwind
- ✅ `global.css` - Estilos globales
- ✅ `metro.config.js` - Configuración de Metro para NativeWind
- ✅ `nativewind-env.d.ts` - Tipos de TypeScript
- ✅ Pantallas actualizadas con clases de Tailwind

## 🎨 Uso:

Ahora puedes usar clases de Tailwind en tus componentes:

```tsx
<View className="flex-1 bg-gray-50 p-4">
  <Text className="text-2xl font-bold text-blue-600">
    Hola Mundo
  </Text>
</View>
```

## 📚 Documentación:

- [NativeWind Docs](https://www.nativewind.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
