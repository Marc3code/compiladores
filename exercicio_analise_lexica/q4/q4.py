import re

# Expressão regular da questão 1
regex = re.compile(r'''
^
(?:                             # --- símbolo ---
    \$                          # somente $
  | [A-Za-z]+\$?                # letras + opcional $
)
(?:                             # --- formas de número ---
    -                           # caso negativo com sinal
    (?:0|[1-9]\d{0,2}|[1-9]\d?(?:\.\d{3})+) , \d{2,}
  |
    \(                          # entre parênteses
        (?:0|[1-9]\d{0,2}|[1-9]\d?(?:\.\d{3})+) , \d{2,}
    \)
  |
    (?:0|[1-9]\d{0,2}|[1-9]\d?(?:\.\d{3})+) , \d{2,}
)
$
''', re.VERBOSE)

def validar_linha(linha: str) -> bool:
    linha = linha.strip()
    return bool(regex.match(linha))

def main():
    arquivo = "inputs.txt"

    try:
        with open(arquivo, "r", encoding="utf-8") as f:
            linhas = f.readlines()
    except FileNotFoundError:
        print(f"Erro: o arquivo '{arquivo}' não foi encontrado.")
        return

    for linha in linhas:
        texto = linha.strip()
        if not texto:
            continue

        if validar_linha(texto):
            print(f"{texto:<25}  →  VÁLIDO")
        else:
            print(f"{texto:<25}  →  INVÁLIDO")

if __name__ == "__main__":
    main()
