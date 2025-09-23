# Nim tem tipagem estática, mas também consegue inferir o tipo sozinho. 

# --- Tipagem explícita ---
var idade_exp: int = 21      
var altura_exp: float = 1.75 

# --- Inferência de tipo ---
var idade_inf = 21           
var altura_inf = 1.75      

echo "Tipagem explícita -> idade: ", idade_exp, " (int), altura: ", altura_exp, " (float)"
echo "Inferência de tipo -> idade: ", idade_inf, " (int), altura: ", altura_inf, " (float)"

# Também dá pra usar let (imutável) e const (fixo em tempo de compilação)
let nome = "Terceiro"
const pi = 3.1415

echo "Nome: ", nome
echo "Constante pi = ", pi
