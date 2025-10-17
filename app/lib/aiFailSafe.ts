export function aiFailSafe(message: string) {
  return {
    role: "assistant",
    content: message || "Ha ocurrido un error al conectar con la IA. Inténtalo de nuevo más tarde.",
  };
}