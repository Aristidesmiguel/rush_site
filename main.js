/*
╔══════════════════════════════════════════════════════════════════╗
║  RUSH — DOCUMENTAÇÃO INTERATIVA                                  ║
║  main.js — Toda a lógica da aplicação                            ║
║                                                                  ║
║  Estrutura:                                                      ║
║  1. Dados (DICT, FILES, FUNCTIONS, QUIZ)                         ║
║  2. Conversor de números                                         ║
║  3. Construtores de UI (buildXxx)                                ║
║  4. Handlers interativos                                         ║
║  5. Init                                                         ║
╚══════════════════════════════════════════════════════════════════╝
*/

'use strict';

/* ════════════════════════════════════════════════════════════
   1. DADOS ESTÁTICOS
   ════════════════════════════════════════════════════════════ */

var DICT = {
  0:'zero', 1:'one', 2:'two', 3:'three', 4:'four',
  5:'five', 6:'six', 7:'seven', 8:'eight', 9:'nine',
  10:'ten', 11:'eleven', 12:'twelve', 13:'thirteen',
  14:'fourteen', 15:'fifteen', 16:'sixteen', 17:'seventeen',
  18:'eighteen', 19:'nineteen', 20:'twenty', 30:'thirty',
  40:'forty', 50:'fifty', 60:'sixty', 70:'seventy',
  80:'eighty', 90:'ninety', 100:'hundred', 1000:'thousand',
  1000000:'million', 1000000000:'billion',
  1000000000000:'trillion'
};

var DICT_ENTRIES = Object.keys(DICT).map(function(k) {
  return { key: Number(k), val: DICT[k] };
});

/* ── FILES DATA ── */
var FILES = [
  {
    name: 'header.h', icon: '📋', type: 'Cabeçalho Global', color: '#3B9EFF',
    desc: 'Inclui as 3 bibliotecas do sistema e declara todos os protótipos de função. O include guard (#ifndef HEADER_H) garante que o arquivo não seja incluído duas vezes durante a compilação.',
    tags: ['<unistd.h>', '<stdlib.h>', '<fcntl.h>', '#ifndef', 'protótipos']
  },
  {
    name: 'main.c', icon: '🚀', type: 'Ponto de Entrada', color: '#00DDB3',
    desc: 'Ponto de partida do programa. Valida argumentos com args_valid(), carrega o dicionário, executa a conversão e libera toda a memória. Orquestra todo o fluxo.',
    tags: ['main()', 'args_valid()', 'run()', 'run_ok()', 'free()']
  },
  {
    name: 'rush_ini.c', icon: '🔐', type: 'Validação', color: '#FFB830',
    desc: 'Valida os argumentos da linha de comando caractere a caractere. Modo 0 = apenas dígitos. Modo 1 = caminho de arquivo (letras, pontos, barras). Extrai o número para o heap.',
    tags: ['is_valid_arg()', 'get_number()', 'mode 0', 'mode 1']
  },
  {
    name: 'rushfile.c', icon: '📂', type: 'I/O de Arquivo', color: '#FF5B5B',
    desc: 'Localiza o dicionário (padrão "numbers.dict" ou caminho custom) e carrega seu conteúdo em memória usando open(), read(), close() e malloc(). Sem fopen().',
    tags: ['get_dict_path()', 'read_dict_file()', 'open()', 'read()', 'close()']
  },
  {
    name: 'parse.c', icon: '📝', type: 'Parsing', color: '#82AAFF',
    desc: 'Analisa o dicionário linha a linha. parse_line() extrai chave+valor. trim_value() normaliza espaços. next_line() itera o buffer como cursor. dict_is_valid() valida o formato.',
    tags: ['parse_line()', 'trim_value()', 'next_line()', 'dict_is_valid()']
  },
  {
    name: 'lookup.c', icon: '🔎', type: 'Busca no Dicionário', color: '#C3E88D',
    desc: 'Busca palavras por chave numérica (busca linear O(n)). dict_lookup_zeros() identifica palavras de escala contando zeros. write_digit() converte char→chave→palavra.',
    tags: ['dict_lookup()', 'dict_lookup_zeros()', 'write_scale_word()', 'write_digit()']
  },
  {
    name: 'group.c', icon: '🔢', type: 'Conversão', color: '#F78C6C',
    desc: 'Núcleo do algoritmo. advance_gs() calcula grupos de 1-3 dígitos com módulo 3. write_group() combina dígitos com escalas. write_two_digits() trata todos os casos de 00-99.',
    tags: ['advance_gs()', 'write_group()', 'write_group_of_three()', 'write_two_digits()']
  },
  {
    name: 'numbers.dict', icon: '📖', type: 'Dicionário de Dados', color: '#89DDFF',
    desc: 'Arquivo de texto com 40 entradas: 0-19 (nomes únicos), dezenas 20-90, escalas 100 a decillion. Formato: "número: palavra". Qualquer idioma funciona — só troque o arquivo.',
    tags: ['0: zero', '100: hundred', '1000: thousand', '1000000: million']
  }
];

/* ── FLOW STEPS DATA ── */
var FLOW_STEPS = [
  {
    n:'01', title:'Validação de Argumentos', file:'main.c',
    desc:'args_valid() verifica se há 1 ou 2 argumentos válidos. Modo 0 = só dígitos. Modo 1 = caminho de arquivo. Retorna 0 se inválido, imprime "Error\\n" e termina.',
    code:
'/* main.c — args_valid() */\n' +
'static int\targs_valid(int argc, char **argv)\n' +
'{\n' +
'\tif (argc == 2 && is_valid_arg(argv[1], 0))\n' +
'\t\treturn (1);  /* só o número */\n' +
'\tif (argc == 3 && is_valid_arg(argv[1], 1)\n' +
'\t\t\t\t&& is_valid_arg(argv[2], 0))\n' +
'\t\treturn (2);  /* dicionário + número */\n' +
'\treturn (0);      /* inválido */\n' +
'}\n' +
'\n' +
'int\tmain(int argc, char **argv)\n' +
'{\n' +
'\tif (args_valid(argc, argv) >= 1)\n' +
'\t{\n' +
'\t\tif (run(argc, argv) < 0)\n' +
'\t\t\treturn (1);\n' +
'\t\treturn (0);\n' +
'\t}\n' +
'\tprint_str("Error\\n");\n' +
'\treturn (1);\n' +
'}'
  },
  {
    n:'02', title:'Localizar o Dicionário', file:'rushfile.c',
    desc:'get_dict_path() decide qual arquivo usar: "numbers.dict" (padrão) ou argv[1] (custom). Copia o caminho para o heap com malloc(100) — sobrevive entre funções.',
    code:
'/* rushfile.c — get_dict_path() */\n' +
'char\t*get_dict_path(int argc, char **argv)\n' +
'{\n' +
'\tchar\t*src;\n' +
'\tchar\t*filename;\n' +
'\tint\t\tc;\n' +
'\n' +
'\tif (argc == 2)\n' +
'\t\tsrc = "numbers.dict"; /* padrão */\n' +
'\telse\n' +
'\t\tsrc = argv[1];        /* custom */\n' +
'\tc = 0;\n' +
'\tfilename = (char *)malloc(100 * sizeof(char));\n' +
'\twhile (src[c] != \'\\0\')\n' +
'\t{\n' +
'\t\tfilename[c] = src[c];\n' +
'\t\tc++;\n' +
'\t}\n' +
'\tfilename[c] = \'\\0\';\n' +
'\treturn (filename);\n' +
'}'
  },
  {
    n:'03', title:'Carregar o Arquivo', file:'rushfile.c',
    desc:'open() abre o arquivo. read() lê até 4095 bytes. close() fecha imediatamente (libera recurso). buf[len]="\\0" termina a string. malloc(len+1) copia para o heap.',
    code:
'/* rushfile.c — read_dict_file() */\n' +
'char\t*read_dict_file(char *filename)\n' +
'{\n' +
'\tint\t\tfd;\n' +
'\tint\t\tlen;\n' +
'\tchar\t*dict;\n' +
'\tchar\tbuf[4096]; /* buffer na stack */\n' +
'\n' +
'\tfd = open(filename, O_RDONLY);   /* abre */\n' +
'\tif (fd < 0)\n' +
'\t\treturn ((char *)0);  /* NULL = erro */\n' +
'\tlen = read(fd, buf, 4095);       /* lê */\n' +
'\tclose(fd);    /* fecha IMEDIATAMENTE */\n' +
'\tif (len < 0)\n' +
'\t\treturn ((char *)0);\n' +
'\tbuf[len] = \'\\0\'; /* termina a string */\n' +
'\tdict = (char *)malloc((len + 1) * sizeof(char));\n' +
'\ti = 0;\n' +
'\twhile (i <= len)  /* copia para heap */\n' +
'\t\tdict[i] = buf[i++];\n' +
'\treturn (dict);\n' +
'}'
  },
  {
    n:'04', title:'Validar o Dicionário', file:'parse.c',
    desc:'dict_is_valid() percorre cada linha. parse_line() verifica o formato "número: palavra". Se qualquer linha estiver malformada, retorna 0 (inválido) e o programa imprime "Dict Error".',
    code:
'/* parse.c — dict_is_valid() */\n' +
'int\tdict_is_valid(char *dict)\n' +
'{\n' +
'\tint\t\ti;\n' +
'\tlong\tkey;\n' +
'\tint\t\tret;\n' +
'\tchar\tline[512];\n' +
'\tchar\tval[256];\n' +
'\n' +
'\ti = 0;\n' +
'\twhile (dict[i] != \'\\0\')\n' +
'\t{\n' +
'\t\ti = next_line(dict, i, line); /* pega linha */\n' +
'\t\tret = parse_line(line, &key, val, 256);\n' +
'\t\tif (ret == -1)              /* linha ruim */\n' +
'\t\t\treturn (0);\n' +
'\t\tif (ret == 1 && trim_value(val, line, 512) < 0)\n' +
'\t\t\treturn (0);             /* valor vazio */\n' +
'\t}\n' +
'\treturn (1);                     /* tudo OK */\n' +
'}'
  },
  {
    n:'05', title:'Extrair o Número', file:'rush_ini.c',
    desc:'get_number() aloca 40 bytes no heap e copia o argumento do número para lá. O índice i é 1 (sem dicionário custom) ou 2 (com dicionário custom).',
    code:
'/* rush_ini.c — get_number() */\n' +
'void\tget_number(int argc, char **argv, char **nbr)\n' +
'{\n' +
'\tint\ti;\n' +
'\tint\tj;\n' +
'\n' +
'\tj = 0;\n' +
'\tif (argc == 2)\n' +
'\t\ti = 1;  /* ./rush 42 */\n' +
'\telse\n' +
'\t\ti = 2;  /* ./rush dict.txt 42 */\n' +
'\t*nbr = (char *)malloc(40 * sizeof(char));\n' +
'\twhile (argv[i][j] != \'\\0\')\n' +
'\t{\n' +
'\t\t(*nbr)[j] = argv[i][j];\n' +
'\t\tj++;\n' +
'\t}\n' +
'\t(*nbr)[j] = \'\\0\';\n' +
'}'
  },
  {
    n:'06', title:'Loop de Conversão', file:'group.c',
    desc:'write_number() itera sobre o número em grupos. advance_gs() calcula o tamanho do grupo. has_nonzero() pula grupos de zeros (ex: "000" em 1000000). write_group() imprime cada grupo.',
    code:
'/* group.c — write_number() */\n' +
'int\twrite_number(char *nbr, char *dict)\n' +
'{\n' +
'\tint\tlen;\n' +
'\tint\tpos;\n' +
'\tint\tgs;\n' +
'\tint\tfirst;\n' +
'\n' +
'\tlen = str_len(nbr);\n' +
'\tpos = 0;\n' +
'\tfirst = 1;\n' +
'\twhile (pos < len)\n' +
'\t{\n' +
'\t\tgs = advance_gs(len, pos);\n' +
'\t\tif (has_nonzero(nbr, pos, gs))\n' +
'\t\t{\n' +
'\t\t\tif (!first)\n' +
'\t\t\t\twrite(1, " ", 1); /* espaço entre grupos */\n' +
'\t\t\tif (write_group(nbr, pos, len, dict) < 0)\n' +
'\t\t\t\treturn (-1);\n' +
'\t\t\tfirst = 0;\n' +
'\t\t}\n' +
'\t\tpos += gs;\n' +
'\t}\n' +
'\treturn (1);\n' +
'}'
  },
  {
    n:'07', title:'Grupo + Escala', file:'group.c',
    desc:'write_group() combina dois ingredientes: os dígitos do grupo (write_group_of_three) e a palavra de escala (dict_lookup_zeros). "rem" é o número de zeros após o grupo = a escala.',
    code:
'/* group.c — write_group() */\n' +
'int\twrite_group(char *nbr, int pos, int len, char *dict)\n' +
'{\n' +
'\tint\t\trem;\n' +
'\tchar\tword[256];\n' +
'\tint\t\tgs;\n' +
'\n' +
'\tgs = advance_gs(len, pos); /* tamanho do grupo */\n' +
'\tif (write_group_of_three(nbr, pos, gs, dict) < 0)\n' +
'\t\treturn (-1);\n' +
'\n' +
'\trem = len - pos - gs;  /* zeros restantes */\n' +
'\tif (rem > 0)\n' +
'\t{\n' +
'\t\twrite(1, " ", 1);\n' +
'\t\t/* rem=3 -> "thousand"  rem=6 -> "million" */\n' +
'\t\tif (dict_lookup_zeros(dict, rem, word, 256) < 0)\n' +
'\t\t\treturn (-1);\n' +
'\t\tprint_str(word);\n' +
'\t}\n' +
'\treturn (1);\n' +
'}'
  },
  {
    n:'08', title:'Imprimir Palavras', file:'lookup.c',
    desc:'write_digit() converte o char dígito numa chave numérica (com base no type: 0=unidade, 1=dezena, 2=teen), busca no dicionário e imprime com write(). É o elo final da cadeia.',
    code:
'/* lookup.c — write_digit() */\n' +
'int\twrite_digit(char dig, int type, char *dict)\n' +
'{\n' +
'\tlong\tkey;\n' +
'\n' +
'\tif (type == 1)\n' +
'\t\tkey = (long)(dig - \'0\') * 10; /* \'4\' -> 40 */\n' +
'\telse if (type == 2)\n' +
'\t\tkey = 10 + (long)(dig - \'0\'); /* \'5\' -> 15 */\n' +
'\telse\n' +
'\t\tkey = (long)(dig - \'0\');      /* \'7\' -> 7  */\n' +
'\treturn (write_scale_word(key, dict));\n' +
'}\n' +
'\n' +
'/* write_scale_word busca e imprime */\n' +
'int\twrite_scale_word(long key, char *dict)\n' +
'{\n' +
'\tchar\tword[256];\n' +
'\n' +
'\tif (dict_lookup(dict, key, word, 256) < 0)\n' +
'\t\treturn (-1);\n' +
'\tprint_str(word); /* chama write() */\n' +
'\treturn (1);\n' +
'}'
  },
  {
    n:'09', title:'Liberar Memória', file:'main.c',
    desc:'Após a conversão, free() libera os 3 ponteiros alocados com malloc(). Boa prática: todo malloc() tem seu free() correspondente. Sem isso = memory leak.',
    code:
'/* main.c — run() — cleanup final */\n' +
'static int\trun(int argc, char **argv)\n' +
'{\n' +
'\tchar\t*filename;\n' +
'\tchar\t*dict;\n' +
'\tchar\t*nbr;\n' +
'\tint\t\tret;\n' +
'\n' +
'\t/* ... carrega e converte ... */\n' +
'\n' +
'\t/* LIBERA TUDO ANTES DE RETORNAR */\n' +
'\tfree(filename); /* malloc(100)       */\n' +
'\tfree(dict);     /* malloc(len + 1)   */\n' +
'\tfree(nbr);      /* malloc(40)        */\n' +
'\treturn (ret);\n' +
'}'
  },
  {
    n:'10', title:'Nova Linha Final', file:'main.c',
    desc:'write(1, "\\n", 1) imprime a nova linha no stdout após o resultado. Se houve erro de dicionário, imprime "Dict Error\\n". O processo termina com exit code 0 (ok) ou 1 (erro).',
    code:
'/* main.c — run_ok() */\n' +
'static void\trun_ok(char *nbr, char *dict, int *ret)\n' +
'{\n' +
'\t*ret = write_number(nbr, dict);\n' +
'\tif (*ret >= 0)\n' +
'\t\twrite(1, "\\n", 1);          /* sucesso */\n' +
'\telse\n' +
'\t\tprint_str("Dict Error\\n"); /* falhou */\n' +
'}'
  }
];

/* ── FUNCTIONS DATA ── */
var FUNCTIONS = [];

function fn(cat, name, sig, analogy_icon, analogy, desc, how, code, params, retOk, retErr, extra) {
  FUNCTIONS.push({ cat:cat, name:name, sig:sig, analogy_icon:analogy_icon, analogy:analogy, desc:desc, how:how, code:code, params:params, retOk:retOk, retErr:retErr, extra:extra });
}

fn('syscall','open()','int open(const char *path, int flags)',
  '🚪',
  'Como bater na porta de um arquivo e pedir permissão para entrar. Se a porta abrir, você recebe um número de entrada (file descriptor). Se estiver trancada ou não existir, recebe -1.',
  'O sistema operacional mantém uma tabela de arquivos abertos por processo. open() cria uma entrada nessa tabela e devolve o índice — o file descriptor (fd). No projeto, usamos O_RDONLY porque só precisamos ler o dicionário, nunca escrever.',
  [
    'Você passa o caminho do arquivo e uma flag de abertura',
    'O kernel verifica se o arquivo existe e se você tem permissão',
    'Se OK: cria entrada na tabela de fds e retorna o índice (3, 4, 5...)',
    'Se erro: retorna -1 (arquivo não existe, sem permissão, etc.)'
  ],
'/* rushfile.c */\n' +
'fd = open(filename, O_RDONLY); /* abre só para leitura */\n' +
'if (fd < 0)\n' +
'    return ((char *)0); /* NULL = arquivo não encontrado */\n' +
'\n' +
'/* Flags disponíveis (O_RDONLY é o único usado aqui): */\n' +
'/* O_RDONLY = 0  -> só leitura                        */\n' +
'/* O_WRONLY = 1  -> só escrita                         */\n' +
'/* O_RDWR   = 2  -> leitura e escrita                 */\n' +
'/* O_CREAT      -> cria o arquivo se não existir      */',
  [['filename','Caminho: "numbers.dict" ou argv[1]'],['flags','O_RDONLY: abre somente para leitura (valor = 0)']],
  'fd >= 0 — inteiro representando o arquivo na tabela do kernel',
  '-1 — arquivo não encontrado ou sem permissão de leitura',
  'Cada fd aberto consome um recurso do sistema. O processo tem limite (~1024 fds abertos simultâneos). Por isso fechamos com close() imediatamente após o read() — não esperamos o fim da função.'
);

fn('syscall','read()','ssize_t read(int fd, void *buf, size_t count)',
  '📖',
  'Como ler páginas de um livro e copiar para um caderno. O livro não se move — mas você avança no ponto onde parou. O caderno não recebe ponto final automático: você mesmo precisa colocar o \\0.',
  'read() lê bytes brutos do arquivo — ela não sabe nada sobre strings, linhas ou formatação. É responsabilidade do programador adicionar o null-terminator (\'\\0\') para transformar os bytes lidos em uma string C válida. No projeto lemos até 4095 bytes — o suficiente para o numbers.dict inteiro.',
  [
    'O kernel copia os dados do arquivo para o buffer fornecido',
    'Retorna o número real de bytes copiados (pode ser menos que count)',
    'NÃO adiciona null-terminator — é só uma cópia de bytes brutos',
    'O ponteiro interno do fd avança automaticamente para a próxima leitura'
  ],
'/* rushfile.c */\n' +
'char buf[4096]; /* buffer na STACK — 4096 bytes */\n' +
'\n' +
'len = read(fd, buf, 4095); /* lê até 4095 bytes */\n' +
'close(fd);                  /* fecha o fd logo após */\n' +
'if (len < 0)\n' +
'    return ((char *)0);\n' +
'\n' +
'buf[len] = \'\\0\'; /* CRUCIAL: transforma bytes em string C */\n' +
'/*                                                        */\n' +
'/* Por que 4095 e não 4096?                              */\n' +
'/* Para reservar buf[4095] para o \'\\0\'                   */\n' +
'/* O array tem posições [0..4095] = 4096 bytes no total  */',
  [['fd','File descriptor retornado por open()'],['buf','Endereço do buffer que receberá os bytes'],['count','Máximo de bytes a ler — 4095 no projeto']],
  'Número de bytes lidos (0 = fim do arquivo)',
  '-1 em erro de leitura',
  'Por que não usar fread()? A Escola 42 exige apenas as syscalls POSIX. fread() é uma função da biblioteca C padrão que faz buffering interno. read() é direta ao kernel — mais baixo nível e educativa.'
);

fn('syscall','write()','ssize_t write(int fd, const void *buf, size_t count)',
  '🖨️',
  'Como uma impressora que imprime exatamente o que você manda. Diferente do printf(), ela não sabe o que é \\0 nem formata nada — imprime exatamente count bytes, sem mais nem menos.',
  'O projeto proíbe printf() (regra da Escola 42). Toda impressão é feita com write(). fd=1 é o stdout (terminal). write() é usada de 3 formas: imprimir palavras, imprimir espaços separadores e imprimir a nova linha final.',
  [
    'fd=0 é stdin (teclado), fd=1 é stdout (tela), fd=2 é stderr',
    'Escreve exatamente count bytes — não para no \'\\0\'',
    'Retorna quantos bytes foram realmente escritos no sistema',
    'É a única forma de saída permitida neste projeto'
  ],
'/* Três usos no projeto: */\n' +
'write(1, " ", 1);   /* espaço entre palavras    */\n' +
'write(1, "\\n", 1); /* nova linha no final       */\n' +
'\n' +
'/* print_str() usa write() internamente: */\n' +
'void\tprint_str(char *str)\n' +
'{\n' +
'    int len = str_len(str); /* conta chars sem strlen */\n' +
'    write(1, str, len);      /* imprime exatamente len bytes */\n' +
'}\n' +
'\n' +
'/* Para imprimir "forty two": */\n' +
'write(1, "forty", 5);\n' +
'write(1, " ",     1);\n' +
'write(1, "two",   3);\n' +
'write(1, "\\n",   1);',
  [['fd','1=stdout (tela), 2=stderr (erros do sistema)'],['buf','Dados a escrever — qualquer sequência de bytes'],['count','Quantidade exata de bytes a escrever']],
  'Número de bytes escritos (normalmente == count)',
  '-1 em erro (raro: disco cheio, fd fechado)',
  'Por que não printf()? A Escola 42 quer que você entenda as syscalls reais. printf() faz buffering, formatação (%s, %d), e várias chamadas de sistema por baixo dos panos. write() é direto ao kernel — uma syscall, um resultado.'
);

fn('syscall','close()','int close(int fd)',
  '🔒',
  'Como devolver a chave depois de sair de um quarto. Se você não devolver (não chamar close()), o sistema pensa que o arquivo ainda está em uso — um "resource leak".',
  'Após o read(), o file descriptor já cumpriu sua função — o conteúdo está no buffer. Manter o fd aberto seria desperdício de recurso. O projeto fecha imediatamente após a leitura, antes mesmo de processar os dados.',
  [
    'Informa ao kernel que não precisamos mais deste fd',
    'O kernel libera a entrada na tabela de fds do processo',
    'O arquivo em disco não é afetado — só a "conexão" ao arquivo é encerrada',
    'Não fecha o arquivo em si — apenas a referência local a ele'
  ],
'/* rushfile.c — padrão do projeto */\n' +
'fd  = open(filename, O_RDONLY); /* abre  */\n' +
'len = read(fd, buf, 4095);      /* lê    */\n' +
'close(fd); /* fecha AQUI — não no final! */\n' +
'           /* O conteúdo já está em buf  */\n' +
'\n' +
'/* O que acontece se não fechar: */\n' +
'/* fd = open("a.txt", O_RDONLY); -> fd=3 */\n' +
'/* fd = open("b.txt", O_RDONLY); -> fd=4 */\n' +
'/* fd = open("c.txt", O_RDONLY); -> fd=5 */\n' +
'/* ... após ~1021 opens sem close():     */\n' +
'/* open() retorna -1: "too many open files" */',
  [['fd','O file descriptor a ser fechado']],
  '0 em sucesso',
  '-1 se fd for inválido (já fechado ou nunca aberto)',
  'Esquecer o close() é um resource leak. Em programas curtos (como este) o OS limpa tudo ao terminar. Mas em servidores que rodam 24/7, não fechar fds pode esgotar o limite do sistema em horas.'
);

fn('syscall','malloc()','void *malloc(size_t size)',
  '🏗️',
  'Como reservar um terreno na cidade (o "heap"). Você diz quantos metros quer, recebe o endereço, e pode construir lá. Mas a prefeitura não derruba o que você construiu sozinha — você precisa chamar free().',
  'A memória em C tem dois tipos: stack (local, automática, destruída ao sair da função) e heap (dinâmica, sobrevive entre funções, só liberada com free()). O projeto usa malloc() 3 vezes para que os dados sobrevivam entre chamadas de função.',
  [
    'Stack: variáveis locais como char buf[4096] — destruídas ao sair da função',
    'Heap: malloc() — sobrevive até free() ser explicitamente chamado',
    'malloc() retorna void* — deve ser convertido para o tipo correto',
    'Sempre verificar se retornou NULL (sem memória disponível no sistema)'
  ],
'/* Três usos no projeto: */\n' +
'\n' +
'/* 1. Em get_dict_path() — 100 bytes para o caminho */\n' +
'char *filename = (char *)malloc(100 * sizeof(char));\n' +
'\n' +
'/* 2. Em read_dict_file() — tamanho exato do arquivo */\n' +
'char *dict = (char *)malloc((len + 1) * sizeof(char));\n' +
'/*                                  ^^^               */\n' +
'/*                          +1 para o \'\\0\' final      */\n' +
'\n' +
'/* 3. Em get_number() — 40 bytes para o número */\n' +
'char *nbr = (char *)malloc(40 * sizeof(char));\n' +
'/*          suporta até 39 dígitos (> long long) */\n' +
'\n' +
'/* Por que não usar arrays locais? */\n' +
'/* char filename[100]; -> morre ao sair de get_dict_path()! */',
  [['size','Bytes a alocar. Use (n+1) para strings — espaço para o \'\\0\'']],
  'Ponteiro void* para a área alocada no heap',
  'NULL — sistema sem memória disponível',
  'sizeof(char) é sempre 1 em qualquer arquitetura, mas escrevê-lo é boa prática — documenta a intenção. O cast (char*) não é obrigatório em C mas é em C++. A Escola 42 usa-o para clareza.'
);

fn('syscall','free()','void free(void *ptr)',
  '♻️',
  'Como devolver o terreno à prefeitura. Se você não devolver (não chamar free()), a memória fica ocupada para sempre durante a execução do programa — mesmo que você não use mais.',
  'Todo malloc() deve ter um free() correspondente. O projeto libera os 3 ponteiros no final de run() em main.c. A ordem não importa — mas nunca libere o mesmo ponteiro duas vezes (double free).',
  [
    'Marca o bloco de memória como disponível para reutilização',
    'NÃO apaga os dados imediatamente — só marca como "livre"',
    'free(NULL) é completamente seguro — não faz nada',
    'Liberar duas vezes o mesmo ponteiro = double free = crash'
  ],
'/* main.c — cleanup em run() */\n' +
'free(filename); /* libera malloc(100)     */\n' +
'free(dict);     /* libera malloc(len+1)   */\n' +
'free(nbr);      /* libera malloc(40)      */\n' +
'\n' +
'/* Correto: liberar uma vez */\n' +
'char *p = malloc(10);\n' +
'free(p);        /* OK */\n' +
'\n' +
'/* ERRADO: double free (crash/comportamento indefinido) */\n' +
'char *p = malloc(10);\n' +
'free(p);        /* 1ª vez: OK    */\n' +
'free(p);        /* 2ª vez: CRASH */\n' +
'\n' +
'/* Seguro: free(NULL) não faz nada */\n' +
'char *p = NULL;\n' +
'free(p); /* OK — sem crash */',
  [['ptr','Ponteiro retornado por malloc(). free(NULL) é seguro.']],
  'void — não retorna valor',
  'N/A — free() não falha (apenas free(ptr_inválido) tem comportamento indefinido)',
  'Como detectar memory leaks? Use Valgrind: "valgrind ./rush-02 42". Ele reporta cada malloc() sem free() correspondente. Também é útil definir o ponteiro como NULL após free() para evitar "use after free".'
);

fn('parse','parse_line()','int parse_line(char *line, long *key, char *val, int valsz)',
  '🔬',
  'Como um leitor que pega a linha "1000: thousand" e a divide em duas partes: o número (1000) e o texto ("thousand"). Se a linha não seguir o formato, avisa que está errada.',
  'Implementa um mini-parser manual sem usar atoi(), sscanf() ou strtol(). Converte a string numérica para long com o truque key = key*10 + (c - \'0\') — o jeito clássico em C de converter string para inteiro.',
  [
    'Verifica se a linha começa com dígito (0-9) — senão retorna -1',
    'Converte dígitos para long: key = key*10 + (c - \'0\')',
    'Pula espaços/tabs entre o número e o ":"',
    'Exige o ":" obrigatório — se não tiver, retorna -1 (malformado)',
    'Copia tudo após ":" para o buffer val'
  ],
'/* parse.c — parse_line() — o truque de conversão */\n' +
'\n' +
'/* Como "1000" vira o long 1000: */\n' +
'/* key = 0                        */\n' +
'/* key = 0  * 10 + (\'1\'-\'0\') = 1  */\n' +
'/* key = 1  * 10 + (\'0\'-\'0\') = 10  */\n' +
'/* key = 10 * 10 + (\'0\'-\'0\') = 100  */\n' +
'/* key = 100* 10 + (\'0\'-\'0\') = 1000 */\n' +
'\n' +
'/* O truque \'c\' - \'0\': */\n' +
'/* \'0\' tem valor ASCII = 48         */\n' +
'/* \'7\' tem valor ASCII = 55         */\n' +
'/* \'7\' - \'0\' = 55 - 48 = 7         */\n' +
'\n' +
'*key = 0;\n' +
'while (line[i] >= \'0\' && line[i] <= \'9\')\n' +
'    *key = *key * 10 + (line[i++] - \'0\');\n' +
'while (line[i] == \' \' || line[i] == \'\\t\')\n' +
'    i++;\n' +
'if (line[i] != \':\')\n' +
'    return (-1); /* formato inválido */',
  [['line','Linha completa: "1000: thousand"'],['*key','Saída: a chave numérica (1000)'],['val','Saída: o texto após ":" (" thousand")'],['valsz','Tamanho máximo do buffer val (256)']],
  '1 = sucesso, chave e valor preenchidos | 0 = linha vazia (pular)',
  '-1 = linha malformada (sem dígito inicial ou sem ":")',
  'O truque key = key*10 + (c-\'0\') é O JEITO clássico de converter string para número em C sem usar funções de biblioteca. Cada novo dígito "empurra" os anteriores para a esquerda (×10) e adiciona o novo no final.'
);

fn('parse','next_line()','int next_line(char *dict, int i, char *line)',
  '📜',
  'Como um cursor lendo um rolo de papel. Você começa na posição i, lê até o próximo Enter, copia para um bloco de notas e te diz onde ficou — para você continuar de lá.',
  'O dicionário inteiro está em memória como uma string gigante com \\n entre as linhas. next_line() é um iterador: dado um índice i, extrai a próxima linha em line e retorna o novo índice. Sem split(), sem strtok().',
  [
    'A partir de dict[i], copia chars para line até achar \\n ou \\0',
    'Adiciona \\0 ao final de line — transforma em string C',
    'Se o char atual é \\n, avança i para além do \\n',
    'Retorna o novo i — pronto para a próxima chamada'
  ],
'/* parse.c — next_line() */\n' +
'\n' +
'/* O dicionário em memória (simplificado): */\n' +
'/* "0: zero\\n1: one\\n2: two\\n..."          */\n' +
'/*  ^i=0        ^i=8     ^i=15             */\n' +
'\n' +
'/* Chamada 1: next_line(dict, 0, line)     */\n' +
'/*  -> line = "0: zero"                   */\n' +
'/*  -> retorna 8                           */\n' +
'\n' +
'/* Chamada 2: next_line(dict, 8, line)     */\n' +
'/*  -> line = "1: one"                    */\n' +
'/*  -> retorna 15                          */\n' +
'\n' +
'/* Padrão de uso em todo o projeto: */\n' +
'int i = 0;\n' +
'while (dict[i] != \'\\0\')\n' +
'{\n' +
'    i = next_line(dict, i, line); /* i sempre avança */\n' +
'    /* processa line... */\n' +
'}',
  [['dict','Buffer completo do dicionário em memória'],['i','Posição atual no buffer (começa em 0)'],['line','Buffer de saída: a linha extraída (max 511 chars)']],
  'Novo índice logo após o \\n da linha extraída',
  'N/A — always succeeds if i is valid',
  'O padrão "i = next_line(dict, i, line)" garante que i sempre avance. Se next_line() retornasse o mesmo valor, entraríamos em loop infinito. Funciona como um iterador de linhas sem alocação de memória extra.'
);

fn('lookup','dict_lookup()','int dict_lookup(char *dict, long key, char *out, int outsz)',
  '🔍',
  'Como procurar um produto numa lista de preços linha por linha: você vai de cima para baixo, compara o código, e quando acha, pega o valor e vai embora. Se chegar ao fim sem achar, volta de mãos vazias.',
  'Busca sequencial O(n) pelo dicionário. Não há índice nem hash — cada chamada percorre do início ao fim. Para 40 entradas é negligenciável. A vantagem é suportar qualquer dicionário custom sem preprocessing.',
  [
    'Começa do início do dicionário (i=0)',
    'Extrai cada linha com next_line()',
    'Analisa com parse_line() — obtém k e val',
    'Compara k == key — se igual, normaliza e retorna',
    'Se percorreu tudo sem achar — retorna -1'
  ],
'/* lookup.c — dict_lookup() */\n' +
'\n' +
'/* Exemplo: dict_lookup(dict, 40, out, 256) */\n' +
'\n' +
'/* linha "0:  zero"  -> k=0  != 40 -> próxima */\n' +
'/* linha "1:  one"   -> k=1  != 40 -> próxima */\n' +
'/* ...                                         */\n' +
'/* linha "40: forty" -> k=40 == 40 -> ACHOU!  */\n' +
'/*   -> trim_value(" forty", out, 256)         */\n' +
'/*   -> out = "forty"                          */\n' +
'/*   -> retorna 1                              */\n' +
'\n' +
'while (dict[i] != \'\\0\')\n' +
'{\n' +
'    i = next_line(dict, i, line);\n' +
'    ret = parse_line(line, &k, val, 256);\n' +
'    if (ret == 1 && k == key)    /* MATCH */\n' +
'        return (trim_value(val, out, outsz));\n' +
'}\n' +
'return (-1); /* não encontrado */',
  [['dict','Buffer completo do dicionário'],['key','Número a encontrar (1, 10, 100, 1000...)'],['out','Buffer de saída: palavra encontrada'],['outsz','Tamanho máximo de out (256 no projeto)']],
  '1 — palavra copiada em out',
  '-1 — chave não existe no dicionário',
  'Por que não um array indexado (DICT[key])? O projeto usa dicionário externo personalizável. Qualquer idioma funciona: troque "one" por "um", "thousand" por "mil". A busca linear torna isso possível sem preprocessing.'
);

fn('lookup','dict_lookup_zeros()','int dict_lookup_zeros(char *dict, int nzeros, char *out, int outsz)',
  '🔭',
  'Esta função procura palavras de escala contando zeros: 2 zeros = hundred, 3 zeros = thousand, 6 zeros = million. É mais simples contar zeros do que comparar números gigantescos.',
  'Por que não usar dict_lookup(dict, 1000000, ...)? Porque os números de escala são gigantes (1000000000000 etc.) e comparar long pode ter problemas de overflow. Contar zeros é mais robusto e funciona para qualquer escala no dicionário.',
  [
    'Pula linhas que não começam com "1" — escalas sempre começam com 1 seguido de zeros',
    'Conta quantos zeros existem após o "1" (antes do ":")',
    'Se a contagem == nzeros e o próximo char é ":" ou " " — achou!',
    'Valida com parse_line() e normaliza com trim_value()'
  ],
'/* lookup.c — dict_lookup_zeros() */\n' +
'\n' +
'/* nzeros=2 -> procura "100:"  -> "hundred"   */\n' +
'/* nzeros=3 -> procura "1000:" -> "thousand"  */\n' +
'/* nzeros=6 -> procura "1000000:" -> "million" */\n' +
'\n' +
'while (dict[i] != \'\\0\')\n' +
'{\n' +
'    i = next_line(dict, i, line);\n' +
'    if (line[0] != \'1\') continue; /* pula */\n' +
'    j = 0;\n' +
'    while (line[1 + j] == \'0\') j++; /* conta zeros */\n' +
'    if (j == nzeros && (line[1+j] == \':\' || line[1+j] == \' \'))\n' +
'        if (parse_line(line, &key, val, 256) == 1)\n' +
'            return (trim_value(val, out, outsz));\n' +
'}\n' +
'return (-1);',
  [['nzeros','Zeros a contar: 2=hundred, 3=thousand, 6=million, 9=billion, 12=trillion']],
  '1 — palavra de escala copiada em out',
  '-1 — escala não encontrada no dicionário',
  'O "rem" em write_group() representa exatamente os dígitos restantes após o grupo atual. Para "1042" após o grupo "1" (pos=0, gs=1), rem = 4-0-1 = 3. Então dict_lookup_zeros(dict, 3, ...) = "thousand".'
);

fn('group','advance_gs()','int advance_gs(int len, int pos)',
  '📐',
  'Como cortar um barbante em pedaços de no máximo 3 cm usando matemática simples. advance_gs() usa o operador módulo para descobrir quanto "sobra" no início — e esse é o tamanho do primeiro grupo.',
  'Chave do algoritmo de agrupamento. Números são processados em grupos de 3 dígitos da esquerda para a direita. Mas o primeiro grupo pode ter 1, 2 ou 3 dígitos dependendo do comprimento total. O operador % resolve isso elegantemente.',
  [
    'Calcula gs = (len - pos) % 3',
    'Se gs == 0 — o grupo tem exatamente 3 dígitos',
    'Se gs == 1 — o primeiro grupo tem apenas 1 dígito',
    'Se gs == 2 — o primeiro grupo tem 2 dígitos'
  ],
'/* group.c — advance_gs() */\n' +
'int\tadvance_gs(int len, int pos)\n' +
'{\n' +
'    int gs;\n' +
'    gs = (len - pos) % 3;\n' +
'    if (gs == 0) gs = 3;\n' +
'    return (gs); /* sempre 1, 2 ou 3 */\n' +
'}\n' +
'\n' +
'/* Exemplos visuais:          */\n' +
'/* "5"      len=1: gs=1%3=1  */\n' +
'/* "42"     len=2: gs=2%3=2  */\n' +
'/* "999"    len=3: gs=3%3=0 -> gs=3 */\n' +
'/* "1042"   len=4:           */\n' +
'/*   pos=0: gs=4%3=1 -> grupo "1"   rem=3 -> thousand */\n' +
'/*   pos=1: gs=3%3=0 -> gs=3 -> grupo "042" rem=0     */\n' +
'/* "1000000" len=7:           */\n' +
'/*   pos=0: gs=7%3=1 -> "1"  rem=6 -> million         */\n' +
'/*   pos=1: gs=6%3=0 -> gs=3 -> "000" (zeros, pula)   */\n' +
'/*   pos=4: gs=3%3=0 -> gs=3 -> "000" (zeros, pula)   */',
  [['len','Comprimento total do número em dígitos'],['pos','Posição atual no processamento (começa em 0)']],
  '1, 2 ou 3 — tamanho do próximo grupo a processar',
  'N/A — sempre retorna valor válido',
  'O truque do módulo: qualquer comprimento tem uma "sobra" ao dividir por 3. Essa sobra é exatamente o tamanho do primeiro grupo. Se a sobra for 0, o primeiro grupo tem 3 dígitos completos.'
);

fn('group','write_two_digits()','int write_two_digits(char *nbr, int start, char *dict)',
  '🃏',
  'Esta função conhece todas as regras do jogo de dois dígitos. Ela analisa os dois chars e decide a estratégia: teen especial? dezena simples? dezena + unidade? só unidade? Cobre todos os 100 casos (00 a 99).',
  'Trata todos os casos de dois dígitos em inglês. O inglês tem irregularidades (10-19 têm nomes únicos — eleven, twelve, thirteen...), por isso o caso "1X" precisa de tratamento especial com type=2.',
  [
    'tens = \'1\' → teen (10-19): write_digit(units, type=2) → busca 10+units',
    'tens != \'0\' e != \'1\' → dezena (20-90): write_digit(tens, type=1)',
    'Se units != \'0\': adiciona espaço + write_digit(units, type=0)',
    'tens == \'0\' e units != \'0\' → só unidade: write_digit(units, type=0)',
    'tens == \'0\' e units == \'0\' → "00" → retorna sem imprimir nada'
  ],
'/* group.c — write_two_digits() — todos os casos */\n' +
'\n' +
'/* "15": tens=\'1\' -> TEEN                        */\n' +
'/*   write_digit(\'5\', type=2)                    */\n' +
'/*   key = 10 + 5 = 15 -> "fifteen"             */\n' +
'\n' +
'/* "40": tens=\'4\', units=\'0\' -> DEZENA SIMPLES  */\n' +
'/*   write_digit(\'4\', type=1) -> 40 -> "forty"  */\n' +
'/*   units=\'0\' -> não imprime unidade            */\n' +
'\n' +
'/* "42": tens=\'4\', units=\'2\' -> DEZENA+UNIDADE  */\n' +
'/*   write_digit(\'4\', type=1) -> "forty"        */\n' +
'/*   write(1, " ", 1)                           */\n' +
'/*   write_digit(\'2\', type=0) -> "two"          */\n' +
'\n' +
'/* "07": tens=\'0\', units=\'7\' -> SÓ UNIDADE      */\n' +
'/*   write_digit(\'7\', type=0) -> "seven"        */\n' +
'\n' +
'/* "00": tens=\'0\', units=\'0\' -> NADA            */\n' +
'/*   return (1) sem chamar write()              */',
  [['nbr','Buffer do número completo'],['start','Índice do dígito das dezenas neste grupo']],
  '1 — impressão bem-sucedida',
  '-1 — falha na busca do dicionário',
  'Por que teens são especiais? Em inglês, 10-19 têm nomes únicos (ten, eleven, twelve...). Em português seria diferente: dezasseis = dez + seis. O dicionário e o código teriam que ser adaptados para cada idioma.'
);

/* ── MAKEFILE DATA ── */
var MAKE_RULES = [
  {
    target: 'all', short: 'Regra padrão — compila o projeto',
    prereq: '$(NAME) — depende do executável',
    cmd: '(nenhum comando direto — delega para $(NAME))',
    desc: 'A regra "all" é a regra padrão do Makefile. Ao digitar apenas "make", o Make executa esta regra. Ela depende de $(NAME), então o Make verifica se o executável existe e está atualizado. Se não, compila.',
    analogy: 'Como o botão "Play" de uma IDE — ao clicar, ele sabe exatamente o que precisa fazer.',
    usage: 'make'
  },
  {
    target: '$(NAME) — rush-02', short: 'Compilação real — todos os .c em um executável',
    prereq: '(sem pré-requisitos)',
    cmd: 'gcc $(FLAGS) -o $(NAME) $(SRC)',
    desc: 'A regra de compilação real. O gcc recebe as flags (-Wall -Wextra -Werror), o nome de saída (-o rush-02) e todos os arquivos .c. Compila tudo de uma vez sem gerar arquivos .o intermediários — direto para o executável final.',
    analogy: 'Como um padeiro que mistura todos os ingredientes de uma vez e assa o bolo diretamente — sem etapas intermediárias.',
    usage: 'make rush-02  (ou simplesmente: make)'
  },
  {
    target: 'clean', short: 'Remove arquivos .o intermediários',
    prereq: '(sem pré-requisitos)',
    cmd: '$(RM) *.o  →  /bin/rm -f *.o',
    desc: 'Remove todos os arquivos objeto (.o). Neste projeto, o gcc compila direto sem gerar .o, então clean na prática não remove nada. Mas é incluído por convenção da Escola 42 — boa prática em todo projeto C.',
    analogy: 'Como limpar a bancada de trabalho mantendo o produto final intacto.',
    usage: 'make clean'
  },
  {
    target: 'fclean', short: 'Remove .o e o executável — full clean',
    prereq: 'clean (executa clean primeiro)',
    cmd: '$(RM) $(NAME)  →  /bin/rm -f rush-02',
    desc: 'Full clean: executa "clean" (remove .o) e depois remove o próprio executável rush-02. Após fclean, o projeto volta ao estado original — só os .c e o Makefile. A flag -f no rm evita erro se o arquivo não existir.',
    analogy: 'Como demolir a obra inteira para reconstruir do zero.',
    usage: 'make fclean'
  },
  {
    target: 're', short: 'Recompila tudo do zero (fclean + all)',
    prereq: 'fclean → all (nesta ordem)',
    cmd: '(fclean remove tudo, all recompila)',
    desc: 'Recompila tudo: primeiro faz fclean (remove tudo), depois faz all (recompila do zero). Útil quando você mudou algo que pode ter ficado em cache ou quer garantir compilação 100% limpa e consistente.',
    analogy: 'Ctrl+Shift+P → "Rebuild All" de uma IDE — apaga completamente e reconstrói.',
    usage: 'make re'
  }
];

/* ── QUIZ DATA ── */
var QUESTIONS = [
  {cat:'Syscalls', q:'O que a função <code>open()</code> retorna em caso de sucesso?', opts:['Um ponteiro para o arquivo','Um file descriptor (inteiro >= 0)','O conteúdo do arquivo em string','NULL'], ans:1, exp:'open() retorna um file descriptor — um inteiro não-negativo (3, 4, 5...). Os valores 0, 1 e 2 já estão reservados: stdin, stdout e stderr respectivamente.'},
  {cat:'Syscalls', q:'Por que <code>buf[len] = 0</code> é necessário após <code>read()</code>?', opts:['Para liberar a memória do buffer','read() copia bytes brutos — não adiciona null-terminator automaticamente','Para fechar o arquivo corretamente','Para evitar que o próximo read() sobreponha os dados'], ans:1, exp:'read() é uma syscall de baixo nível que copia bytes brutos. Ela não sabe o que é uma string C. Sem o null-terminator manual, percursos como while(dict[i]) teriam comportamento indefinido.'},
  {cat:'Syscalls', q:'Quais os valores padrão de fd para stdin, stdout e stderr?', opts:['1, 2, 3','0, 1, 2','0, 2, 1','-1, 0, 1'], ans:1, exp:'Convenção POSIX: fd=0 é stdin (teclado), fd=1 é stdout (tela), fd=2 é stderr (erros). O projeto usa write(1, ...) para todos os resultados e write(1, "\\n", 1) para a nova linha.'},
  {cat:'Syscalls', q:'Por que o projeto usa <code>write()</code> em vez de <code>printf()</code>?', opts:['printf() é mais lento em sistemas POSIX','A Escola 42 restringe o uso de printf() neste projeto','write() formata melhor o texto','printf() não funciona com strings longas'], ans:1, exp:'A Escola 42 impõe restrições às funções permitidas. Usar write() obriga o aluno a entender as syscalls reais — sem a camada de abstração do printf() (buffering, formatação, etc.).'},
  {cat:'Syscalls', q:'O que acontece ao chamar <code>open()</code> ~1024 vezes sem <code>close()</code>?', opts:['O sistema libera fds automaticamente','Falha: "too many open files" — limite de fds por processo esgotado','O programa continua normalmente','O kernel reinicia o processo'], ans:1, exp:'Sistemas POSIX limitam o número de file descriptors abertos por processo (geralmente ~1024). Não fechar fds causa resource leak — os recursos ficam ocupados até o processo terminar.'},
  {cat:'Syscalls', q:'Qual flag é usada em <code>open()</code> no projeto e o que significa?', opts:['O_WRONLY — abre para escrita','O_RDONLY — abre somente para leitura','O_RDWR — leitura e escrita','O_CREAT — cria se não existir'], ans:1, exp:'O_RDONLY (valor inteiro 0) abre o arquivo somente para leitura. É a escolha correta porque o projeto nunca precisa modificar o dicionário.'},
  {cat:'Syscalls', q:'O que <code>malloc()</code> retorna se não houver memória disponível?', opts:['0 (zero inteiro)','NULL (ponteiro nulo)','Um ponteiro para memória temporária','-1'], ans:1, exp:'malloc() retorna NULL em caso de falha de alocação. Usar um ponteiro NULL causa segmentation fault. O projeto não verifica explicitamente — uma limitação conhecida do código.'},
  {cat:'Syscalls', q:'O que é "double free" e por que é perigoso?', opts:['Alocar a mesma área de memória duas vezes','Chamar free() duas vezes no mesmo ponteiro — comportamento indefinido','Liberar memória que não foi alocada com malloc','Usar malloc() sem depois chamar free()'], ans:1, exp:'"Double free" é chamar free() duas vezes no mesmo ponteiro. Pode corromper as estruturas internas do heap e causar crash ou vulnerabilidades de segurança. Solução: definir o ponteiro como NULL após free().'},
  {cat:'Parsing', q:'Como <code>parse_line()</code> converte a string "1000" para o long 1000?', opts:['Usa a função atoi()','Usa sscanf() com formato "%ld"','Multiplica por 10 a cada dígito: key = key*10 + (c - 48)','Usa a função strtol()'], ans:2, exp:'O truque key = key*10 + (c - 48) é a conversão clássica sem bibliotecas. Para "1000": 0→1→10→100→1000. c-48 converte o char ASCII para o dígito inteiro (\'7\'=55, \'0\'=48, 55-48=7).'},
  {cat:'Parsing', q:'O que <code>parse_line()</code> retorna para uma linha vazia?', opts:['-1 indicando erro','1 indicando sucesso com chave 0','0 indicando linha vazia — ok, pular','NULL — sem dados'], ans:2, exp:'0 indica linha vazia — não é um erro, apenas não há dados. O chamador verifica: ret==1 = dados válidos, ret==0 = pular a linha, ret==-1 = linha malformada (erro real).'},
  {cat:'Parsing', q:'O que <code>trim_value()</code> faz com "  forty   two  "?', opts:['Remove apenas espaços iniciais','Remove bordas e colapsa espaços internos → "forty two"','Retorna -1 pois há espaços duplos','Não altera nada'], ans:1, exp:'trim_value() faz 3 operações: (1) remove espaços/tabs iniciais, (2) remove espaços/tabs finais, (3) colapsa múltiplos espaços internos em um único. Resultado: "forty two".'},
  {cat:'Parsing', q:'Como <code>next_line()</code> sabe onde começa a próxima linha?', opts:['Usa um contador global de linhas','Retorna o novo índice i (logo após o \\n) para a próxima chamada','Usa um ponteiro estático interno','Recomeça do início do buffer sempre'], ans:1, exp:'next_line() retorna o novo índice. O chamador usa: i = next_line(dict, i, line). Assim i sempre avança — funciona como um iterador sem alocar memória extra.'},
  {cat:'Parsing', q:'O que <code>dict_is_valid()</code> faz com uma linha que começa com "#" (comentário)?', opts:['Ignora a linha e continua normalmente','Retorna 0 — dicionário inválido','Trata como linha vazia e pula','Retorna 1 pois pode ser um comentário válido'], ans:1, exp:'parse_line() retorna -1 se a linha não começar com dígito (0-9). dict_is_valid() verifica: se -1, retorna 0 imediatamente. Linhas de comentário simplesmente não são suportadas.'},
  {cat:'Lookup', q:'Qual a complexidade de tempo de <code>dict_lookup()</code>?', opts:['O(1) — acesso direto por índice','O(log n) — busca binária','O(n) — busca linear sequencial','O(n²) — busca dupla'], ans:2, exp:'dict_lookup() percorre o dicionário do início ao fim — busca linear O(n). Para 40 entradas é rápido. Para dicionários com milhões de entradas, precisaria de uma hash table ou busca binária.'},
  {cat:'Lookup', q:'Como <code>dict_lookup_zeros(dict, 6, ...)</code> encontra "million"?', opts:['Busca a string "million" diretamente','Verifica se a linha começa com "1" e conta exatamente 6 zeros antes de ":"','Usa a chave numérica 1000000 em dict_lookup()','Conta zeros após o ":" na linha'], ans:1, exp:'Conta zeros consecutivos após o "1" inicial: "1000000:" tem 6 zeros → nzeros==6 → match. Funciona para qualquer escala no dicionário, até decillion (33 zeros).'},
  {cat:'Lookup', q:'O que <code>write_scale_word(100, dict)</code> imprime?', opts:['"one hundred"','"100"','"hundred"','Nada — 100 não é palavra de escala'], ans:2, exp:'write_scale_word() busca a chave 100 e encontra "hundred". Imprime apenas "hundred". Quem imprime "three" antes é write_digit(). write_group_of_three() coordena a sequência e os espaços.'},
  {cat:'Lookup', q:'O que <code>write_digit(\'0\', 2, dict)</code> imprime?', opts:['"zero"','"twenty"','"ten"','Nada'], ans:2, exp:'type=2 (teen): key = 10 + (\'0\'-\'0\') = 10 + 0 = 10. Busca no dicionário a chave 10 → "ten". Cobre o número 10 quando tens=\'1\' e units=\'0\' em write_two_digits().'},
  {cat:'Agrupamento', q:'O que <code>advance_gs(4, 0)</code> retorna para o número "1042"?', opts:['3','2','1','4'], ans:2, exp:'gs = (len-pos)%3 = (4-0)%3 = 1. O primeiro grupo tem apenas 1 dígito — o "1" de "1.042". Isso garante que o número seja dividido em grupos 1|042, e não 104|2.'},
  {cat:'Agrupamento', q:'Para "123456", quais são os grupos e escalas?', opts:['"1" (thousand) e "23456"','"123" (thousand) e "456" (sem escala)','"12" (thousand) e "3456"','"123456" (sem grupos)'], ans:1, exp:'len=6: pos=0: gs=3 → grupo "123" (rem=3 → thousand). pos=3: gs=3 → grupo "456" (rem=0 → sem escala). Resultado: "one hundred twenty three thousand four hundred fifty six".'},
  {cat:'Agrupamento', q:'O que <code>write_two_digits()</code> faz com tens=\'1\' units=\'5\' (número 15)?', opts:['Imprime "one five" — um dígito de cada vez','Imprime "fifteen" usando write_digit com type=2','"ten five" — dez mais cinco','Retorna -1 — 15 não é tratado'], ans:1, exp:'tens=\'1\' → caso teen. Chama write_digit(units=\'5\', type=2). type=2: key = 10+5 = 15. Busca 15 → "fifteen". Os teens têm nomes únicos em inglês.'},
  {cat:'Agrupamento', q:'Por que "1000000" imprime "one million" e não "one million zero zero zero..."?', opts:['É um bug no código','has_nonzero() detecta grupos de zeros e os pula','O dicionário não tem entrada para 0 após million','write_group_of_three() bloqueia zeros'], ans:1, exp:'write_number() chama has_nonzero() antes de write_group(). Para os grupos "000" de "1000000", has_nonzero() retorna 0 e o grupo é pulado completamente.'},
  {cat:'Agrupamento', q:'O que <code>write_digit(\'4\', 1, dict)</code> imprime?', opts:['"four"','"forty"','"fourteen"','"four hundred"'], ans:1, exp:'type=1 (dezena): key = (\'4\'-\'0\') * 10 = 4*10 = 40. Busca no dicionário a chave 40 → "forty". O ×10 converte o dígito na posição das dezenas no valor real.'},
  {cat:'Agrupamento', q:'Por que "300" imprime "three hundred" sem espaço extra no final?', opts:['É um bug sorte','write_group_of_three() só adiciona espaço se nonzero=true','write_two_digits("00") retorna sem imprimir nada — e ambos estão corretos','O dicionário não tem "zero"'], ans:2, exp:'Ambos b e c estão corretos! write_group_of_three() verifica nonzero antes de adicionar o espaço. E write_two_digits() com "00" retorna 1 sem chamar nenhum write() — dois mecanismos de proteção.'},
  {cat:'Memória', q:'Por que filename, dict e nbr usam malloc() em vez de arrays locais na stack?', opts:['malloc() é mais rápido','Arrays locais são destruídos ao sair da função — malloc() sobrevive entre funções','malloc() usa menos memória total','Requisito obrigatório da Escola 42'], ans:1, exp:'Arrays locais vivem na stack e morrem quando a função retorna. Se get_dict_path() usasse char filename[100], ao retornar o ponteiro apontaria para memória inválida (stack frame destruído).'},
  {cat:'Memória', q:'Por que <code>malloc((len + 1) * sizeof(char))</code> usa "+1"?', opts:['Para metadados internos do alocador','Para o null-terminator \'\\0\' — transforma bytes em string C válida','Por alinhamento de memória','É um erro — deveria ser apenas len'], ans:1, exp:'Strings em C precisam do null-terminator ao final. Se o arquivo tem len bytes, o buffer precisa de len+1 posições: [0..len-1] para dados e [len] para o \'\\0\' que termina a string.'},
  {cat:'Memória', q:'O que é um memory leak e como verificar?', opts:['malloc() retorna NULL','Memória alocada com malloc() que nunca é liberada com free() — verificar com valgrind','read() lê além do buffer — verificar com gdb','Ponteiro para endereço inválido — verificar com AddressSanitizer'], ans:1, exp:'Memory leak: malloc() chamado mas free() nunca para aquele ponteiro. Valgrind detecta: "valgrind ./rush-02 42". Em servidores 24/7, leaks acumulam até esgotar a RAM.'},
  {cat:'Makefile', q:'O que faz o comando <code>make fclean</code>?', opts:['Remove apenas arquivos .o','Remove arquivos .o e o executável rush-02','Apenas verifica se o código compila','Recompila tudo do zero'], ans:1, exp:'fclean executa "clean" (remove .o) e depois remove o executável. Após fclean, o projeto volta ao estado inicial — apenas os .c e o Makefile.'},
  {cat:'Makefile', q:'O que a flag <code>-Werror</code> do GCC faz?', opts:['Ativa avisos extras além de -Wall','Converte todos os avisos em erros de compilação','Otimiza o código para velocidade','Exibe o assembly gerado'], ans:1, exp:'-Werror converte TODOS os avisos em erros de compilação. O código não compila enquanto houver qualquer aviso. Obriga código perfeito — padrão da Escola 42.'},
  {cat:'Makefile', q:'Como chamar o rush-02 com dicionário personalizado?', opts:['./rush-02 portuguese.dict 42','./rush-02 42 portuguese.dict','./rush-02 42 --dict=portuguese.dict','./rush-02 --lang=pt 42'], ans:0, exp:'Com 3 argumentos: argv[1]=caminho do dicionário, argv[2]=número. args_valid() verifica: argc==3, argv[1] passa is_valid_arg(mode=1), argv[2] passa is_valid_arg(mode=0).'}
];


/* ════════════════════════════════════════════════════════════
   2. CONVERSOR DE NÚMEROS
   ════════════════════════════════════════════════════════════ */

function numToWords(str) {
  if (!str || !/^\d+$/.test(str)) return null;
  var n = BigInt(str);
  if (n === 0n) return 'zero';
  var scales = [
    [1000000000000n,'trillion'],[1000000000n,'billion'],
    [1000000n,'million'],[1000n,'thousand']
  ];
  function grp(x) {
    if (x === 0n) return '';
    var r = '';
    for (var i = 0; i < scales.length; i++) {
      var s = scales[i][0], w = scales[i][1];
      if (x >= s) { r += (r ? ' ' : '') + grp(x/s) + ' ' + w; x = x % s; }
    }
    if (x >= 100n) {
      r += (r ? ' ' : '') + grp(x/100n) + ' hundred'; x = x % 100n;
    }
    if (x > 0n) {
      var teens = ['ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
      var tns   = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
      var uns   = ['','one','two','three','four','five','six','seven','eight','nine'];
      if (x >= 10n && x < 20n) {
        r += (r ? ' ' : '') + teens[Number(x) - 10];
      } else {
        if (x >= 20n) { r += (r ? ' ' : '') + tns[Number(x/10n)]; x = x % 10n; }
        if (x > 0n)   { r += (r ? ' ' : '') + uns[Number(x)]; }
      }
    }
    return r;
  }
  return grp(n);
}


/* ════════════════════════════════════════════════════════════
   3. CONSTRUTORES DE UI
   ════════════════════════════════════════════════════════════ */

/* ── NAV ── */
function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  document.querySelectorAll('.nav-tab').forEach(function(b) { b.classList.remove('active'); });
  document.getElementById('pg-' + id).classList.add('active');
  btn.classList.add('active');
}

/* ── DEMO ── */
function runDemo() {
  var v = document.getElementById('demo-inp').value.trim();
  var el = document.getElementById('demo-res');
  if (!v) {
    el.innerHTML = '<span class="ph">→ resultado aparece aqui</span>';
    el.className = 'demo-result'; return;
  }
  if (!/^\d+$/.test(v)) {
    el.textContent = 'Apenas dígitos são permitidos';
    el.className = 'demo-result err'; return;
  }
  try {
    var w = numToWords(v);
    el.textContent = '→ ' + w;
    el.className = 'demo-result has-val';
  } catch(e) {
    el.textContent = 'Número muito grande para processar';
    el.className = 'demo-result err';
  }
}

/* ── FILES ── */
function buildFiles() {
  var el = document.getElementById('files-grid');
  el.innerHTML = FILES.map(function(f) {
    var tags = f.tags.map(function(t) {
      return '<span class="f-tag" style="background:' + f.color + '18;color:' + f.color + '">' + t + '</span>';
    }).join('');
    return '<div class="file-card" style="border-color:' + f.color + '30">' +
      '<div class="file-card-top">' +
        '<div class="file-ico" style="background:' + f.color + '15;border:1px solid ' + f.color + '30">' + f.icon + '</div>' +
        '<div>' +
          '<div class="file-name" style="color:' + f.color + '">' + f.name + '</div>' +
          '<div class="file-type">' + f.type.toUpperCase() + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="file-card-body">' +
        '<div class="file-desc">' + f.desc + '</div>' +
        '<div class="file-tags">' + tags + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* ── SVG ARCHITECTURE DIAGRAM ── */
function buildArchDiagram() {
  var el = document.getElementById('arch-diagram');
  if (!el) return;
  el.innerHTML = '<svg class="diagram" viewBox="0 0 900 520" xmlns="http://www.w3.org/2000/svg">' +
  /* defs */
  '<defs>' +
    '<marker id="arr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">' +
      '<polygon points="0 0, 8 3, 0 6" fill="#3B9EFF" opacity=".7"/>' +
    '</marker>' +
    '<filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
  '</defs>' +
  /* background grid */
  '<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">' +
    '<path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1C3050" stroke-width="0.5"/>' +
  '</pattern>' +
  '<rect width="900" height="520" fill="url(#grid)"/>' +

  /* ARGV box */
  box(30, 220, 120, 80, '#3B9EFF', 'argv[]', ['argc', 'argv[1]', 'argv[2]']) +

  /* main.c */
  box(200, 200, 130, 120, '#00DDB3', 'main.c', ['args_valid()', 'run()', 'run_ok()']) +

  /* rush_ini.c */
  box(200, 50, 130, 100, '#FFB830', 'rush_ini.c', ['is_valid_arg()', 'get_number()']) +

  /* rushfile.c */
  box(200, 360, 130, 120, '#FF5B5B', 'rushfile.c', ['get_dict_path()', 'read_dict_file()']) +

  /* parse.c */
  box(400, 170, 130, 140, '#82AAFF', 'parse.c', ['next_line()', 'parse_line()', 'trim_value()', 'dict_is_valid()']) +

  /* lookup.c */
  box(400, 330, 130, 120, '#C3E88D', 'lookup.c', ['dict_lookup()', 'dict_lookup_zeros()', 'write_digit()']) +

  /* group.c */
  box(590, 200, 130, 120, '#F78C6C', 'group.c', ['advance_gs()', 'write_group()', 'write_two_digits()']) +

  /* numbers.dict */
  box(590, 360, 130, 80, '#89DDFF', 'numbers.dict', ['40 entradas', 'chave: palavra']) +

  /* STDOUT */
  boxOut(760, 220, 100, 80, '#3B9EFF', 'STDOUT', ['write(1,...)']) +

  /* arrows */
  arr(150, 260, 200, 260) +  /* argv -> main */
  arr(200, 150, 200, 200, 'v') +  /* rush_ini -> main */
  arr(200, 420, 200, 330) +  /* rushfile -> main — upward, so use custom */
  arrUp(265, 360, 265, 320) +  /* main -> rushfile */
  arrRight(330, 260, 400, 260) + /* main -> parse */
  arrRight(330, 300, 400, 350) + /* main -> lookup */
  arrRight(530, 260, 590, 260) + /* parse -> group */
  arrRight(530, 390, 590, 390) + /* lookup -> dict */
  arrRight(720, 260, 760, 260) + /* group -> stdout */

  /* labels on arrows */
  '<text x="345" y="252" fill="#8AADCC" font-size="10" font-family="monospace">dict</text>' +
  '<text x="345" y="342" fill="#8AADCC" font-size="10" font-family="monospace">dict</text>' +
  '<text x="538" y="252" fill="#8AADCC" font-size="10" font-family="monospace">write</text>' +

  '</svg>';
}

function box(x, y, w, h, color, title, items) {
  var rows = items.map(function(item, i) {
    return '<text x="' + (x + 10) + '" y="' + (y + 38 + i * 18) + '" fill="' + color + '" font-size="10" font-family="monospace" opacity=".85">' + item + '</text>';
  }).join('');
  return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" fill="' + color + '0C" stroke="' + color + '" stroke-width="1.5"/>' +
    '<text x="' + (x + 10) + '" y="' + (y + 22) + '" fill="' + color + '" font-size="12" font-family="monospace" font-weight="700">' + title + '</text>' +
    '<line x1="' + x + '" y1="' + (y + 28) + '" x2="' + (x + w) + '" y2="' + (y + 28) + '" stroke="' + color + '" stroke-width=".5" opacity=".4"/>' +
    rows;
}

function boxOut(x, y, w, h, color, title, items) {
  return box(x, y, w, h, color, title, items) +
    '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" fill="none" stroke="' + color + '" stroke-width="2" stroke-dasharray="5,3"/>';
}

function arr(x1, y1, x2, y2) {
  return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#3B9EFF" stroke-width="1.5" opacity=".5" marker-end="url(#arr)"/>';
}
function arrRight(x1, y1, x2, y2) { return arr(x1, y1, x2, y2); }
function arrUp(x1, y1, x2, y2) { return arr(x1, y1, x2, y2); }

/* ── MEMORY DIAGRAM (SVG) ── */
function buildMemDiagram() {
  var el = document.getElementById('mem-diagram');
  if (!el) return;
  var svg = '<svg class="diagram" viewBox="0 0 800 300" xmlns="http://www.w3.org/2000/svg">';
  svg += '<defs><marker id="arr2" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#FFB830"/></marker></defs>';

  /* Stack column */
  svg += '<rect x="60" y="20" width="200" height="260" rx="10" fill="#0C1826" stroke="#1C3050" stroke-width="1.5"/>';
  svg += '<text x="160" y="42" text-anchor="middle" fill="#8AADCC" font-size="12" font-family="monospace" font-weight="700">STACK</text>';
  svg += '<text x="160" y="58" text-anchor="middle" fill="#4A6A8A" font-size="10" font-family="monospace">(memória local)</text>';

  var stackItems = [
    { label:'buf[4096]', color:'#FF5B5B', desc:'read_dict_file()' },
    { label:'line[512]', color:'#82AAFF', desc:'parse.c funções' },
    { label:'val[256]',  color:'#82AAFF', desc:'parse.c funções' },
    { label:'word[256]', color:'#C3E88D', desc:'lookup.c funções' }
  ];
  stackItems.forEach(function(item, i) {
    var yy = 75 + i * 52;
    svg += '<rect x="75" y="' + yy + '" width="170" height="40" rx="6" fill="' + item.color + '10" stroke="' + item.color + '" stroke-width="1"/>';
    svg += '<text x="160" y="' + (yy + 15) + '" text-anchor="middle" fill="' + item.color + '" font-size="11" font-family="monospace" font-weight="700">' + item.label + '</text>';
    svg += '<text x="160" y="' + (yy + 30) + '" text-anchor="middle" fill="#4A6A8A" font-size="9" font-family="monospace">' + item.desc + '</text>';
  });
  svg += '<text x="160" y="288" text-anchor="middle" fill="#4A6A8A" font-size="9" font-family="monospace">destruída ao sair da função</text>';

  /* Heap column */
  svg += '<rect x="320" y="20" width="200" height="260" rx="10" fill="#0C1826" stroke="#1C3050" stroke-width="1.5"/>';
  svg += '<text x="420" y="42" text-anchor="middle" fill="#8AADCC" font-size="12" font-family="monospace" font-weight="700">HEAP</text>';
  svg += '<text x="420" y="58" text-anchor="middle" fill="#4A6A8A" font-size="10" font-family="monospace">(malloc / free)</text>';

  var heapItems = [
    { label:'filename', color:'#FFB830', desc:'malloc(100)    → get_dict_path()' },
    { label:'dict',     color:'#FF5B5B', desc:'malloc(len+1)  → read_dict_file()' },
    { label:'nbr',      color:'#00DDB3', desc:'malloc(40)     → get_number()' }
  ];
  heapItems.forEach(function(item, i) {
    var yy = 75 + i * 68;
    svg += '<rect x="335" y="' + yy + '" width="170" height="54" rx="6" fill="' + item.color + '10" stroke="' + item.color + '" stroke-width="1"/>';
    svg += '<text x="420" y="' + (yy + 20) + '" text-anchor="middle" fill="' + item.color + '" font-size="12" font-family="monospace" font-weight="700">' + item.label + '</text>';
    svg += '<text x="420" y="' + (yy + 38) + '" text-anchor="middle" fill="#4A6A8A" font-size="9" font-family="monospace">' + item.desc + '</text>';
  });
  svg += '<text x="420" y="288" text-anchor="middle" fill="#4A6A8A" font-size="9" font-family="monospace">sobrevive até free() ser chamado</text>';

  /* free() arrows */
  var freeY = [88, 156, 224];
  freeY.forEach(function(y) {
    svg += '<line x1="505" y1="' + y + '" x2="590" y2="' + y + '" stroke="#FFB830" stroke-width="1" stroke-dasharray="4,3" marker-end="url(#arr2)"/>';
  });

  /* free box */
  svg += '<rect x="590" y="60" width="140" height="200" rx="10" fill="#FFB83010" stroke="#FFB830" stroke-width="1.5" stroke-dasharray="6,3"/>';
  svg += '<text x="660" y="95" text-anchor="middle" fill="#FFB830" font-size="14" font-family="monospace" font-weight="700">free()</text>';
  svg += '<text x="660" y="120" text-anchor="middle" fill="#8AADCC" font-size="10" font-family="monospace">em run()</text>';
  svg += '<text x="660" y="140" text-anchor="middle" fill="#8AADCC" font-size="10" font-family="monospace">no final</text>';
  svg += '<text x="660" y="200" text-anchor="middle" fill="#FFB830" font-size="11" font-family="monospace">free(filename)</text>';
  svg += '<text x="660" y="220" text-anchor="middle" fill="#FFB830" font-size="11" font-family="monospace">free(dict)</text>';
  svg += '<text x="660" y="240" text-anchor="middle" fill="#FFB830" font-size="11" font-family="monospace">free(nbr)</text>';

  svg += '</svg>';
  el.innerHTML = svg;
}

/* ── FLOW ── */
function buildFlow() {
  var el = document.getElementById('flow-container');
  el.innerHTML = FLOW_STEPS.map(function(s, i) {
    var codeBlock = '<div class="code-art flow-code">' +
      '<div class="code-art-bar">' +
        '<div class="code-art-dots"><span></span><span></span><span></span></div>' +
        '<div class="code-art-title">' + s.file + '</div>' +
      '</div>' +
      '<div class="code-art-body">' + s.code + '</div>' +
    '</div>';
    return '<div class="flow-step" id="fs' + i + '" onclick="toggleFlow(' + i + ')">' +
      '<div class="flow-step-left">' +
        '<div class="flow-dot">' + s.n + '</div>' +
        '<div class="flow-line"></div>' +
      '</div>' +
      '<div class="flow-body">' +
        '<div class="flow-body-title">' + s.title + ' <span class="flow-file">' + s.file + '</span></div>' +
        '<div class="flow-desc">' + s.desc + '</div>' +
        codeBlock +
      '</div>' +
    '</div>';
  }).join('');
}

function toggleFlow(i) {
  document.getElementById('fs' + i).classList.toggle('open');
}

/* ── TRACE ── */
function updateTrace() {
  var v = document.getElementById('trace-inp').value.trim();
  var el = document.getElementById('trace-out');
  if (!v || !/^\d+$/.test(v)) { el.innerHTML = ''; return; }
  var len = v.length;
  var lines = [];
  function tl(t, cls) { return '<div class="trace-line' + (cls ? ' ' + cls : '') + '">' + t + '</div>'; }
  lines.push(tl('$ ./rush-02 ' + v));
  lines.push(tl('  args_valid(2, ["./rush-02","' + v + '"]) = 1', 't-ok'));
  lines.push(tl('  get_dict_path(2, argv) = "numbers.dict"'));
  lines.push(tl('  read_dict_file("numbers.dict")'));
  lines.push(tl('    open("numbers.dict", O_RDONLY) = 3', 't-hit'));
  lines.push(tl('    read(3, buf, 4095) = ~410 bytes', 't-hit'));
  lines.push(tl('    close(3)', 't-ok'));
  lines.push(tl('    malloc(411) = 0x... [heap]', 't-ok'));
  lines.push(tl('  dict_is_valid(dict) = 1 (40 linhas OK)', 't-ok'));
  lines.push(tl('  get_number() -> malloc(40) -> "' + v + '"'));
  lines.push(tl('  write_number("' + v + '", dict):'));
  var pos = 0;
  while (pos < len) {
    var gs = (len - pos) % 3; if (!gs) gs = 3;
    var rem = len - pos - gs;
    var grp = v.slice(pos, pos + gs);
    var sc = rem===3?'thousand':rem===6?'million':rem===9?'billion':rem===12?'trillion':'';
    var nonzero = grp.split('').some(function(c) { return c !== '0'; });
    if (nonzero) {
      lines.push(tl('    write_group(pos=' + pos + ', gs=' + gs + ') grp="' + grp + '" rem=' + rem + (sc ? ' -> ' + sc : ''), 't-hit'));
    } else {
      lines.push(tl('    write_group(pos=' + pos + ', gs=' + gs + ') grp="' + grp + '" [zeros, skip]'));
    }
    pos += gs;
  }
  try {
    var w = numToWords(v);
    if (w) {
      lines.push(tl('  write(1, "' + w + '", ' + w.length + ')', 't-arrow'));
      lines.push(tl('  write(1, "\\n", 1)', 't-arrow'));
    }
  } catch(e) {}
  lines.push(tl('  free(filename) free(dict) free(nbr)'));
  lines.push(tl('  exit(0)', 't-ok'));
  el.innerHTML = lines.join('');
}

/* ── FUNCTIONS ── */
function buildFunctions() {
  var el = document.getElementById('fn-list');
  el.innerHTML = FUNCTIONS.map(function(f, i) {
    var how = f.how.map(function(s, j) {
      return '<div class="how-step"><div class="how-num">' + (j+1) + '</div><div class="how-text">' + s + '</div></div>';
    }).join('');
    var params = f.params.length ?
      '<table class="p-table"><tr><th>Parâmetro</th><th>O que significa</th></tr>' +
      f.params.map(function(p) { return '<tr><td>' + p[0] + '</td><td>' + p[1] + '</td></tr>'; }).join('') +
      '</table>' : '';
    var body = '<div class="analogy-box"><div class="analogy-icon">' + f.analogy_icon + '</div><div class="analogy-text">' + f.analogy + '</div></div>' +
      '<div class="fn-desc">' + f.desc + '</div>' +
      '<div class="how-steps"><div class="how-title">COMO FUNCIONA — PASSO A PASSO</div>' + how + '</div>' +
      '<div class="code-art"><div class="code-art-bar"><div class="code-art-dots"><span></span><span></span><span></span></div><div class="code-art-title">' + f.name + ' — código do projeto</div><button class="code-art-copy" onclick="copyCode(this)">copiar</button></div><div class="code-art-body">' + f.code + '</div></div>' +
      params +
      '<div class="ret-row"><span>✅ Retorno OK: <span class="ret-ok">' + f.retOk + '</span></span><span>❌ Retorno Erro: <span class="ret-err">' + f.retErr + '</span></span></div>' +
      '<div class="extra-box">' + f.extra + '</div>';
    return '<div class="fn-card" id="fn' + i + '" data-cat="' + f.cat + '">' +
      '<div class="fn-card-head" onclick="toggleFn(' + i + ')">' +
        '<span class="fn-badge badge-' + f.cat + '">' + f.cat.toUpperCase() + '</span>' +
        '<span class="fn-name">' + f.name + '</span>' +
        '<span class="fn-brief">' + f.sig + '</span>' +
        '<span class="fn-chevron">▾</span>' +
      '</div>' +
      '<div class="fn-card-body">' + body + '</div>' +
    '</div>';
  }).join('');
}

function toggleFn(i) {
  document.getElementById('fn' + i).classList.toggle('open');
}

function filterFns(cat, btn) {
  document.querySelectorAll('.fn-filter-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.querySelectorAll('.fn-card').forEach(function(c) {
    c.style.display = (cat === 'all' || c.dataset.cat === cat) ? 'block' : 'none';
  });
}

function copyCode(btn) {
  var code = btn.closest('.code-art').querySelector('.code-art-body').textContent;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(function() {
      btn.textContent = 'copiado!';
      setTimeout(function() { btn.textContent = 'copiar'; }, 2000);
    });
  }
}

/* ── DICT ── */
function buildDict() {
  var el = document.getElementById('dict-entries');
  el.innerHTML = DICT_ENTRIES.map(function(e) {
    return '<div class="dict-row" id="dr' + e.key + '" onclick="showDictTrace(' + e.key + ')">' +
      '<div class="dict-key">' + e.key + '</div>' +
      '<div class="dict-val">' + e.val + '</div>' +
    '</div>';
  }).join('');
}

function showDictTrace(key) {
  document.querySelectorAll('.dict-row').forEach(function(r) { r.classList.remove('active'); });
  var row = document.getElementById('dr' + key);
  if (row) { row.classList.add('active'); row.scrollIntoView({ block: 'nearest' }); }
  var el = document.getElementById('dict-trace');
  var lines = [];
  function tl(t, cls) { return '<div class="trace-line' + (cls ? ' ' + cls : '') + '">' + t + '</div>'; }
  lines.push(tl('dict_lookup(dict, ' + key + ', out, 256)'));
  lines.push(tl('i = 0'));
  for (var i = 0; i < DICT_ENTRIES.length; i++) {
    var e = DICT_ENTRIES[i];
    if (e.key === key) {
      lines.push(tl('  linha ' + (i+1) + ': k=' + e.key + ' == ' + key + ' ✓ ENCONTRADO', 't-hit'));
      lines.push(tl('  → trim_value("' + e.val + '", out, 256)', 't-arrow'));
      lines.push(tl('  → write(1, "' + e.val + '", ' + e.val.length + ')', 't-arrow'));
      lines.push(tl('  → return 1', 't-ok'));
      break;
    } else {
      if (i < 5 || i > DICT_ENTRIES.length - 3) {
        lines.push(tl('  linha ' + (i+1) + ': k=' + e.key + ' != ' + key + ' → próxima'));
      } else if (i === 5) {
        lines.push(tl('  ... [' + (DICT_ENTRIES.length - 8) + ' linhas verificadas] ...'));
      }
    }
  }
  el.innerHTML = lines.join('');
}

function dictSearch() {
  var v = document.getElementById('dict-search').value.trim();
  if (!v || !/^\d+$/.test(v)) {
    document.querySelectorAll('.dict-row').forEach(function(r) { r.classList.remove('active'); });
    document.getElementById('dict-trace').innerHTML = '<div class="trace-line" style="color:var(--text3)">Clique numa entrada ou busque...</div>';
    return;
  }
  var key = Number(v);
  if (DICT[key] !== undefined) { showDictTrace(key); return; }
  var el = document.getElementById('dict-trace');
  var lines = [];
  function tl(t, cls) { return '<div class="trace-line' + (cls ? ' ' + cls : '') + '">' + t + '</div>'; }
  lines.push(tl('dict_lookup(dict, ' + key + ', out, 256)'));
  DICT_ENTRIES.slice(0, 5).forEach(function(e, i) {
    lines.push(tl('  linha ' + (i+1) + ': k=' + e.key + ' != ' + key));
  });
  lines.push(tl('  ... [todas as 40 entradas verificadas] ...'));
  lines.push(tl('  → return (-1) // NÃO ENCONTRADO', 't-arrow'));
  el.innerHTML = lines.join('');
}

/* ── MAKEFILE ── */
function buildMake() {
  var el = document.getElementById('make-rules');
  el.innerHTML = MAKE_RULES.map(function(r, i) {
    var rows = [
      ['Pré-requisito', r.prereq],
      ['Comando executado', '<span class="mono" style="color:var(--cyan)">' + r.cmd + '</span>'],
      ['Como usar', '<span class="mono" style="color:var(--amber)">$ ' + r.usage + '</span>']
    ];
    var table = '<table class="p-table"><tr><th>Campo</th><th>Valor</th></tr>' +
      rows.map(function(row) { return '<tr><td>' + row[0] + '</td><td>' + row[1] + '</td></tr>'; }).join('') +
      '</table>';
    return '<div class="make-rule" id="mr' + i + '">' +
      '<div class="make-head" onclick="toggleMake(' + i + ')">' +
        '<span class="fn-badge badge-make">REGRA</span>' +
        '<span class="make-target">' + r.target + '</span>' +
        '<span class="make-short">' + r.short + '</span>' +
        '<span class="fn-chevron" style="margin-left:auto">▾</span>' +
      '</div>' +
      '<div class="make-body">' +
        '<div class="analogy-box"><div class="analogy-icon">💡</div><div class="analogy-text">' + r.analogy + '</div></div>' +
        '<div class="fn-desc">' + r.desc + '</div>' +
        table +
      '</div>' +
    '</div>';
  }).join('');
}

function toggleMake(i) {
  document.getElementById('mr' + i).classList.toggle('open');
}

/* ── QUIZ ── */
var qIdx = 0, qScore = 0, qAnswered = false, qStreak = 0, qResults = [];

function buildQuiz() {
  if (qIdx >= QUESTIONS.length) { showScore(); return; }
  var q = QUESTIONS[qIdx];
  qAnswered = false;
  var pct = (qIdx / QUESTIONS.length) * 100;
  var streakHtml = qStreak >= 2
    ? '<span style="color:var(--amber);font-size:12px;font-weight:700;font-family:var(--mono)">🔥 ' + qStreak + ' seguidas</span>'
    : '';
  var opts = q.opts.map(function(o, i) {
    return '<div class="quiz-opt" id="qo' + i + '" onclick="answerQ(' + i + ')">' +
      '<div class="opt-letter">' + String.fromCharCode(65 + i) + '</div>' +
      '<span>' + o + '</span>' +
    '</div>';
  }).join('');
  document.getElementById('quiz-box').innerHTML =
    '<div class="quiz-top">' +
      '<div style="display:flex;gap:10px;align-items:center">' +
        '<span class="quiz-cat-badge">' + q.cat + '</span>' + streakHtml +
      '</div>' +
      '<span class="quiz-score">✅ ' + qScore + ' / ' + qIdx + '</span>' +
    '</div>' +
    '<div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:' + pct + '%"></div></div>' +
    '<div class="quiz-question">' + q.q + '</div>' +
    '<div class="quiz-opts">' + opts + '</div>' +
    '<div class="quiz-feedback" id="qfb"></div>' +
    '<div class="quiz-nav">' +
      '<button class="btn-next" id="qnxt" onclick="nextQ()">Próxima →</button>' +
      '<button class="btn-outline" onclick="qIdx=0;qScore=0;qStreak=0;qResults=[];buildQuiz()">Reiniciar</button>' +
      '<span class="quiz-counter">' + (qIdx + 1) + ' / ' + QUESTIONS.length + '</span>' +
    '</div>';
}

function answerQ(i) {
  if (qAnswered) return;
  qAnswered = true;
  var q = QUESTIONS[qIdx];
  document.querySelectorAll('.quiz-opt').forEach(function(o) { o.classList.add('disabled'); });
  var fb = document.getElementById('qfb');
  var correct = (i === q.ans);
  qResults.push({ correct: correct, cat: q.cat });
  if (correct) {
    document.getElementById('qo' + i).classList.add('correct');
    qStreak++; qScore++;
    var bonus = qStreak >= 3 ? ' <strong>🔥 ' + qStreak + ' em sequência!</strong>' : '';
    fb.className = 'quiz-feedback show ok';
    fb.innerHTML = '✅ Correto!' + bonus + '<br><span style="font-size:12px;opacity:.9;display:block;margin-top:6px">' + q.exp + '</span>';
  } else {
    document.getElementById('qo' + i).classList.add('wrong');
    document.getElementById('qo' + q.ans).classList.add('correct');
    qStreak = 0;
    fb.className = 'quiz-feedback show no';
    fb.innerHTML = '❌ Incorreto.<br><span style="font-size:12px;opacity:.9;display:block;margin-top:6px">' + q.exp + '</span>';
  }
  var nxt = document.getElementById('qnxt');
  if (nxt) nxt.style.display = 'inline-block';
  qIdx++;
}

function nextQ() { buildQuiz(); }

function showScore() {
  var pct = Math.round(qScore / QUESTIONS.length * 100);
  var stars = pct === 100 ? '🏆' : pct >= 80 ? '⭐⭐' : pct >= 50 ? '⭐' : '📚';
  var msg = pct === 100 ? 'Perfeito! Você dominou o projeto Rush completamente!'
    : pct >= 80 ? 'Excelente! Você entendeu muito bem o código!'
    : pct >= 60 ? 'Bom trabalho! Revise os pontos que errou.'
    : pct >= 40 ? 'Continue estudando — você está no caminho certo!'
    : 'Revise a documentação e tente novamente!';

  var cats = {};
  qResults.forEach(function(r) {
    if (!cats[r.cat]) cats[r.cat] = { ok: 0, total: 0 };
    cats[r.cat].total++;
    if (r.correct) cats[r.cat].ok++;
  });
  var catHtml = Object.keys(cats).map(function(cat) {
    var v = cats[cat];
    var p = Math.round(v.ok / v.total * 100);
    var col = p >= 80 ? 'var(--cyan)' : p >= 50 ? 'var(--amber)' : 'var(--red)';
    return '<div class="score-cat-row">' +
      '<span class="score-cat-name">' + cat + '</span>' +
      '<div class="score-cat-bar"><div class="score-cat-fill" style="background:' + col + ';width:' + p + '%"></div></div>' +
      '<span class="score-cat-num" style="color:' + col + '">' + v.ok + '/' + v.total + '</span>' +
    '</div>';
  }).join('');

  document.getElementById('quiz-box').innerHTML =
    '<div class="score-screen">' +
      '<div class="score-stars">' + stars + '</div>' +
      '<div class="score-pct">' + pct + '%</div>' +
      '<div class="score-label">' + qScore + ' / ' + QUESTIONS.length + ' corretas</div>' +
      '<div class="score-msg">' + msg + '</div>' +
      '<div class="score-cats">' +
        '<div class="score-cats-title">DESEMPENHO POR CATEGORIA</div>' +
        catHtml +
      '</div>' +
      '<div class="score-btns">' +
        '<button class="demo-btn" onclick="qIdx=0;qScore=0;qStreak=0;qResults=[];buildQuiz()">🔄 Tentar Novamente</button>' +
        '<button class="btn-outline" onclick="qIdx=0;qScore=0;qStreak=0;qResults=[];QUESTIONS.sort(function(){return Math.random()-.5;});buildQuiz()">🎲 Ordem Aleatória</button>' +
      '</div>' +
    '</div>';
}


/* ════════════════════════════════════════════════════════════
   TIMELINE — dados e lógica
   ════════════════════════════════════════════════════════════

   Cada STEP tem:
     id        — identificador único
     col       — coluna na timeline (0-based, espaçamento de 80px)
     lane      — linha (índice do arquivo)
     color     — cor do nó
     fn        — nome da função
     file      — arquivo fonte
     calls     — cadeia de chamadas internas [{fn, ret, depth}]
     inputs    — o que entra  [{badge, text}]
     outputs   — o que sai   [{badge, text}]
     desc      — descrição curta
*/

var TL_LANES = [
  { label: 'main.c',      color: '#00DDB3' },
  { label: 'rush_ini.c',  color: '#FFB830' },
  { label: 'rushfile.c',  color: '#FF5B5B' },
  { label: 'parse.c',     color: '#82AAFF' },
  { label: 'lookup.c',    color: '#C3E88D' },
  { label: 'group.c',     color: '#F78C6C' }
];

var TL_STEPS = [
  {
    id: 0, col: 0, lane: 0, color: '#00DDB3',
    fn: 'main()',
    file: 'main.c',
    desc: 'Ponto de entrada. Valida os argumentos e decide se chama run() ou imprime "Error".',
    calls: [
      { fn: 'args_valid(argc, argv)', ret: '1 ou 2', depth: 0 },
      { fn: 'run(argc, argv)',        ret: '0 ou -1', depth: 0 }
    ],
    inputs:  [ { badge:'sys', text:'argc, argv[] do sistema operacional' } ],
    outputs: [ { badge:'ok', text:'exit(0) — sucesso' }, { badge:'err', text:'exit(1) — "Error\\n"' } ]
  },
  {
    id: 1, col: 1, lane: 0, color: '#00DDB3',
    fn: 'args_valid()',
    file: 'main.c',
    desc: 'Valida se o número de argumentos e seus formatos estão corretos (modo 0 = dígitos, modo 1 = caminho).',
    calls: [
      { fn: 'is_valid_arg(argv[1], 0)', ret: '0 ou 1', depth: 1 },
      { fn: 'is_valid_arg(argv[1], 1)', ret: '0 ou 1', depth: 1 },
      { fn: 'is_valid_arg(argv[2], 0)', ret: '0 ou 1', depth: 1 }
    ],
    inputs:  [ { badge:'in', text:'argc (2 ou 3), argv[]' } ],
    outputs: [ { badge:'ok', text:'1 = um arg | 2 = dict+num' }, { badge:'err', text:'0 = inválido' } ]
  },
  {
    id: 2, col: 2, lane: 1, color: '#FFB830',
    fn: 'is_valid_arg()',
    file: 'rush_ini.c',
    desc: 'Verifica caractere por caractere. Modo 0: só dígitos. Modo 1: letras, pontos, barras, hífens.',
    calls: [
      { fn: 'while (argv[c] != \'\\0\')', ret: 'loop', depth: 0 },
      { fn: 'verifica argv[c] >= \'0\'',  ret: 'bool', depth: 1 }
    ],
    inputs:  [ { badge:'in', text:'argv: string do argumento' }, { badge:'in', text:'mode: 0=dígitos, 1=caminho' } ],
    outputs: [ { badge:'ok', text:'1 = argumento válido' }, { badge:'err', text:'0 = caractere inválido encontrado' } ]
  },
  {
    id: 3, col: 3, lane: 0, color: '#00DDB3',
    fn: 'run()',
    file: 'main.c',
    desc: 'Orquestra o fluxo principal: carrega dicionário, valida, extrai número, converte, libera memória.',
    calls: [
      { fn: 'get_dict_path(argc, argv)', ret: 'char*', depth: 0 },
      { fn: 'read_dict_file(filename)',  ret: 'char*', depth: 0 },
      { fn: 'dict_is_valid(dict)',       ret: '0|1',   depth: 0 },
      { fn: 'get_number(argc, argv, &nbr)', ret: 'void', depth: 0 },
      { fn: 'run_ok(nbr, dict, &ret)',   ret: 'void', depth: 0 },
      { fn: 'free(filename|dict|nbr)',   ret: 'void', depth: 0 }
    ],
    inputs:  [ { badge:'in', text:'argc, argv[]' } ],
    outputs: [ { badge:'ok', text:'0 = conversão OK' }, { badge:'err', text:'-1 = "Dict Error"' } ]
  },
  {
    id: 4, col: 4, lane: 2, color: '#FF5B5B',
    fn: 'get_dict_path()',
    file: 'rushfile.c',
    desc: 'Decide qual arquivo usar: "numbers.dict" (padrão) ou argv[1] (custom). Copia para heap com malloc(100).',
    calls: [
      { fn: 'malloc(100 * sizeof(char))', ret: 'char*', depth: 0 },
      { fn: 'while (src[c] != \'\\0\')',    ret: 'loop',  depth: 0 }
    ],
    inputs:  [ { badge:'in', text:'argc: decide padrão ou custom' }, { badge:'in', text:'argv[1]: caminho custom (se argc==3)' } ],
    outputs: [ { badge:'mem', text:'malloc(100) — caminho no heap' }, { badge:'ok', text:'char* filename' } ]
  },
  {
    id: 5, col: 5, lane: 2, color: '#FF5B5B',
    fn: 'read_dict_file()',
    file: 'rushfile.c',
    desc: 'Abre o arquivo, lê até 4095 bytes, fecha imediatamente, adiciona \\0 e copia para o heap.',
    calls: [
      { fn: 'open(filename, O_RDONLY)',    ret: 'fd>=0', depth: 0 },
      { fn: 'read(fd, buf, 4095)',         ret: 'len',   depth: 0 },
      { fn: 'close(fd)',                   ret: '0',     depth: 0 },
      { fn: 'malloc((len+1)*sizeof(char))','ret':'char*', depth: 0 }
    ],
    inputs:  [ { badge:'in', text:'filename: caminho do dicionário' } ],
    outputs: [ { badge:'mem', text:'malloc(len+1) — conteúdo no heap' }, { badge:'ok', text:'char* dict' }, { badge:'err', text:'NULL se falhar' } ]
  },
  {
    id: 6, col: 6, lane: 3, color: '#82AAFF',
    fn: 'dict_is_valid()',
    file: 'parse.c',
    desc: 'Percorre todas as linhas do dicionário verificando o formato "número: palavra". Uma linha ruim invalida tudo.',
    calls: [
      { fn: 'next_line(dict, i, line)',    ret: 'int i', depth: 0 },
      { fn: 'parse_line(line, &k, v, 256)','ret':'0|1|-1',depth: 1 },
      { fn: 'trim_value(val, line, 512)',  ret: '0|1',   depth: 1 }
    ],
    inputs:  [ { badge:'in', text:'dict: buffer completo do dicionário' } ],
    outputs: [ { badge:'ok', text:'1 = todas as linhas válidas' }, { badge:'err', text:'0 = linha malformada encontrada' } ]
  },
  {
    id: 7, col: 7, lane: 3, color: '#82AAFF',
    fn: 'next_line()',
    file: 'parse.c',
    desc: 'Iterador de linhas: a partir do índice i, copia a próxima linha para o buffer e retorna o novo índice.',
    calls: [
      { fn: 'while (dict[i] != \'\\n\')',    ret: 'loop', depth: 0 },
      { fn: 'line[j++] = dict[i++]',       ret: 'copy', depth: 1 }
    ],
    inputs:  [ { badge:'in', text:'dict: buffer do dicionário' }, { badge:'in', text:'i: posição atual (ex: 0)' } ],
    outputs: [ { badge:'ok', text:'novo i: posição após o \\n' }, { badge:'ok', text:'line: a linha extraída como string' } ]
  },
  {
    id: 8, col: 8, lane: 3, color: '#82AAFF',
    fn: 'parse_line()',
    file: 'parse.c',
    desc: 'Extrai chave numérica e valor textual de uma linha. Converte string→long sem atoi(). Exige ":" obrigatório.',
    calls: [
      { fn: 'key = key*10 + (line[i]-\'0\')', ret: 'long', depth: 0 },
      { fn: 'pula espaços até \':\'',          ret: 'skip',  depth: 0 },
      { fn: 'copia val após \':\'',            ret: 'copy',  depth: 0 }
    ],
    inputs:  [ { badge:'in', text:'line: ex. "1000: thousand"' } ],
    outputs: [ { badge:'ok', text:'*key = 1000 (long)' }, { badge:'ok', text:'val = " thousand"' }, { badge:'err', text:'-1 se sem ":" ou sem dígito inicial' } ]
  },
  {
    id: 9, col: 9, lane: 3, color: '#82AAFF',
    fn: 'trim_value()',
    file: 'parse.c',
    desc: 'Remove espaços das bordas e colapsa espaços internos duplos. "  forty   two  " → "forty two".',
    calls: [
      { fn: 'avança s até não-espaço',     ret: 'int s', depth: 0 },
      { fn: 'recua e até não-espaço',      ret: 'int e', depth: 0 },
      { fn: 'copia [s..e] colapsando',     ret: 'copy',  depth: 0 }
    ],
    inputs:  [ { badge:'in', text:'val: " forty   two  " (bruto)' } ],
    outputs: [ { badge:'ok', text:'out = "forty two" (normalizado)' }, { badge:'err', text:'-1 se val era só espaços' } ]
  },
  {
    id: 10, col: 10, lane: 1, color: '#FFB830',
    fn: 'get_number()',
    file: 'rush_ini.c',
    desc: 'Aloca 40 bytes no heap e copia o argumento número de argv. O índice i varia conforme argc.',
    calls: [
      { fn: 'malloc(40 * sizeof(char))',   ret: 'char*', depth: 0 },
      { fn: 'while (argv[i][j] != \'\\0\')', ret: 'loop', depth: 0 }
    ],
    inputs:  [ { badge:'in', text:'argc: decide índice (1 ou 2)' }, { badge:'in', text:'argv[i]: string do número' } ],
    outputs: [ { badge:'mem', text:'malloc(40) — número no heap' }, { badge:'ok', text:'*nbr = "1042"' } ]
  },
  {
    id: 11, col: 11, lane: 5, color: '#F78C6C',
    fn: 'write_number()',
    file: 'group.c',
    desc: 'Loop principal da conversão. Para cada grupo de dígitos, chama write_group() se houver dígito não-zero.',
    calls: [
      { fn: 'advance_gs(len, pos)',        ret: 'int gs', depth: 0 },
      { fn: 'has_nonzero(nbr, pos, gs)',   ret: '0|1',    depth: 0 },
      { fn: 'write_group(nbr, pos, len, dict)', ret: '1|-1', depth: 0 }
    ],
    inputs:  [ { badge:'in', text:'nbr: "1042"' }, { badge:'in', text:'dict: buffer do dicionário' } ],
    outputs: [ { badge:'ok', text:'1 = número impresso no stdout' }, { badge:'err', text:'-1 = chave não encontrada' } ]
  },
  {
    id: 12, col: 12, lane: 5, color: '#F78C6C',
    fn: 'advance_gs()',
    file: 'group.c',
    desc: 'Calcula o tamanho do próximo grupo (1, 2 ou 3) usando módulo: gs = (len-pos)%3. Se 0, retorna 3.',
    calls: [
      { fn: 'gs = (len - pos) % 3',       ret: 'int', depth: 0 },
      { fn: 'if (gs == 0) gs = 3',        ret: 'fix', depth: 0 }
    ],
    inputs:  [ { badge:'in', text:'len: comprimento total do número' }, { badge:'in', text:'pos: posição atual' } ],
    outputs: [ { badge:'ok', text:'1, 2 ou 3 — tamanho do grupo' } ]
  },
  {
    id: 13, col: 13, lane: 5, color: '#F78C6C',
    fn: 'write_group()',
    file: 'group.c',
    desc: 'Combina dígitos com escala: write_group_of_three() imprime os dígitos, dict_lookup_zeros() adiciona "thousand" etc.',
    calls: [
      { fn: 'write_group_of_three(nbr,pos,gs,dict)', ret:'1|-1', depth: 0 },
      { fn: 'rem = len - pos - gs',                  ret:'int',  depth: 0 },
      { fn: 'dict_lookup_zeros(dict, rem, word, 256)', ret:'1|-1', depth: 0 },
      { fn: 'print_str(word)',                        ret:'void', depth: 0 }
    ],
    inputs:  [ { badge:'in', text:'nbr, pos, len: posição no número' }, { badge:'in', text:'dict: dicionário' } ],
    outputs: [ { badge:'ok', text:'write(): "one thousand" no stdout' }, { badge:'err', text:'-1 se chave ausente' } ]
  },
  {
    id: 14, col: 14, lane: 5, color: '#F78C6C',
    fn: 'write_group_of_three()',
    file: 'group.c',
    desc: 'Processa grupo de 1, 2 ou 3 dígitos. Para size=3: imprime centena+"hundred", depois delega 2 restantes.',
    calls: [
      { fn: 'write_digit(nbr[start], 0, dict)',  ret:'1|-1', depth: 0 },
      { fn: 'write_scale_word(100, dict)',         ret:'1|-1', depth: 0 },
      { fn: 'write_two_digits(nbr, start+1, dict)', ret:'1|-1', depth: 0 }
    ],
    inputs:  [ { badge:'in', text:'nbr, start: início do grupo' }, { badge:'in', text:'size: 1, 2 ou 3' } ],
    outputs: [ { badge:'ok', text:'write(): dígitos em palavras' } ]
  },
  {
    id: 15, col: 15, lane: 5, color: '#F78C6C',
    fn: 'write_two_digits()',
    file: 'group.c',
    desc: 'Trata todos os 100 casos de 00-99: teens (10-19), dezenas (20-90), dezena+unidade, só unidade, zero.',
    calls: [
      { fn: 'if (tens==\'1\') write_digit(units,2)', ret:'teen', depth: 0 },
      { fn: 'write_digit(tens, 1, dict)',           ret:'dezena', depth: 0 },
      { fn: 'write_digit(units, 0, dict)',          ret:'unidade', depth: 0 }
    ],
    inputs:  [ { badge:'in', text:'nbr[start]: tens char' }, { badge:'in', text:'nbr[start+1]: units char' } ],
    outputs: [ { badge:'ok', text:'write(): "forty two", "fifteen"...' } ]
  },
  {
    id: 16, col: 16, lane: 4, color: '#C3E88D',
    fn: 'write_digit()',
    file: 'lookup.c',
    desc: 'Converte char dígito → chave long conforme type (0=unidade, 1=dezena×10, 2=teen+10). Delega para write_scale_word().',
    calls: [
      { fn: 'key = (dig-\'0\')*10   [type=1]', ret:'long', depth: 0 },
      { fn: 'key = 10+(dig-\'0\')   [type=2]', ret:'long', depth: 0 },
      { fn: 'key = (dig-\'0\')      [type=0]', ret:'long', depth: 0 },
      { fn: 'write_scale_word(key, dict)',      ret:'1|-1', depth: 1 }
    ],
    inputs:  [ { badge:'in', text:'dig: char \'0\'–\'9\'' }, { badge:'in', text:'type: 0=unidade, 1=dezena, 2=teen' } ],
    outputs: [ { badge:'ok', text:'write(): palavra no stdout' } ]
  },
  {
    id: 17, col: 17, lane: 4, color: '#C3E88D',
    fn: 'write_scale_word()',
    file: 'lookup.c',
    desc: 'Busca a palavra no dicionário pela chave numérica e a imprime com print_str() → write().',
    calls: [
      { fn: 'dict_lookup(dict, key, word, 256)', ret:'1|-1', depth: 0 },
      { fn: 'print_str(word)',                   ret:'void', depth: 0 }
    ],
    inputs:  [ { badge:'in', text:'key: ex. 40 (forty), 15 (fifteen)' } ],
    outputs: [ { badge:'ok', text:'write(1, "forty", 5) no stdout' } ]
  },
  {
    id: 18, col: 18, lane: 4, color: '#C3E88D',
    fn: 'dict_lookup()',
    file: 'lookup.c',
    desc: 'Busca sequencial O(n): percorre todas as linhas do dicionário até encontrar k == key.',
    calls: [
      { fn: 'next_line(dict, i, line)',         ret:'int i', depth: 0 },
      { fn: 'parse_line(line, &k, val, 256)',   ret:'0|1|-1', depth: 1 },
      { fn: 'if (k==key) trim_value(val,...)',  ret:'1|-1',  depth: 1 }
    ],
    inputs:  [ { badge:'in', text:'key: 40' } ],
    outputs: [ { badge:'ok', text:'out = "forty"  return 1' }, { badge:'err', text:'-1 se chave não existe' } ]
  },
  {
    id: 19, col: 19, lane: 4, color: '#C3E88D',
    fn: 'dict_lookup_zeros()',
    file: 'lookup.c',
    desc: 'Busca escala contando zeros: "1000:" tem 3 zeros → nzeros=3 → "thousand". Evita comparar números gigantes.',
    calls: [
      { fn: 'if (line[0]!=\'1\') continue',      ret:'skip', depth: 0 },
      { fn: 'conta zeros após \'1\'',             ret:'int j', depth: 0 },
      { fn: 'if (j==nzeros) parse_line()',       ret:'match',depth: 0 },
      { fn: 'trim_value(val, out, outsz)',        ret:'1|-1', depth: 1 }
    ],
    inputs:  [ { badge:'in', text:'nzeros: ex. 3 (thousand), 6 (million)' } ],
    outputs: [ { badge:'ok', text:'out = "thousand"  return 1' }, { badge:'err', text:'-1 se não encontrado' } ]
  },
  {
    id: 20, col: 20, lane: 0, color: '#00DDB3',
    fn: 'run_ok()',
    file: 'main.c',
    desc: 'Chama write_number() e escreve a nova linha. Se houver erro de dicionário, imprime "Dict Error".',
    calls: [
      { fn: 'write_number(nbr, dict)',   ret:'1|-1', depth: 0 },
      { fn: 'write(1, "\\n", 1)',        ret:'void', depth: 0 },
      { fn: 'print_str("Dict Error\\n")', ret:'void', depth: 0 }
    ],
    inputs:  [ { badge:'in', text:'nbr: número a converter' }, { badge:'in', text:'dict: dicionário carregado' } ],
    outputs: [ { badge:'ok', text:'stdout: "forty two\\n"' }, { badge:'err', text:'stdout: "Dict Error\\n"' } ]
  },
  {
    id: 21, col: 21, lane: 0, color: '#00DDB3',
    fn: 'free() × 3',
    file: 'main.c',
    desc: 'Libera os 3 buffers alocados com malloc(): filename (100B), dict (len+1B), nbr (40B). Sem leaks.',
    calls: [
      { fn: 'free(filename)',  ret:'void', depth: 0 },
      { fn: 'free(dict)',      ret:'void', depth: 0 },
      { fn: 'free(nbr)',       ret:'void', depth: 0 }
    ],
    inputs:  [ { badge:'mem', text:'filename: malloc(100)' }, { badge:'mem', text:'dict: malloc(len+1)' }, { badge:'mem', text:'nbr: malloc(40)' } ],
    outputs: [ { badge:'ok', text:'memória devolvida ao OS' } ]
  }
];

/* ── LANE HEIGHT ── */
var TL_LANE_H = 72;
var TL_COL_W  = 80;

/* ── activeTlStep ── */
var activeTlStep = -1;

function buildTimeline() {
  var wrap = document.getElementById('tl-wrap');
  if (!wrap) return;

  var totalCols = 22;
  var totalW    = 120 + totalCols * TL_COL_W;

  /* ── column headers ── */
  var headHtml = '<div class="tl-col-headers" style="width:' + totalW + 'px">' +
    '<div class="tl-lane-label"></div>' +
    '<div class="tl-col-nums">';
  for (var c = 0; c < totalCols; c++) {
    headHtml += '<div class="tl-col-num">' + (c + 1) + '</div>';
  }
  headHtml += '</div></div>';

  /* ── lanes ── */
  var bodyHtml = '<div class="tl-outer"><div class="tl-lanes" style="width:' + totalW + 'px;position:relative">';

  /* SVG overlay for arrows */
  var svgH = TL_LANES.length * TL_LANE_H;
  var svgW = totalW - 120;
  var svgArrows = '';

  TL_LANES.forEach(function(lane, li) {
    /* gather nodes in this lane */
    var nodes = TL_STEPS.filter(function(s) { return s.lane === li; });
    var nodesHtml = nodes.map(function(step) {
      var x = step.col * TL_COL_W + TL_COL_W / 2 - 36;
      return '<div class="tl-node" id="tln' + step.id + '" ' +
        'style="left:' + x + 'px;color:' + step.color + ';animation-delay:' + (step.id * 0.04) + 's"' +
        ' onclick="tlClickStep(' + step.id + ')">' +
        '<div class="tl-node-inner" data-step="' + (step.id + 1) + '" style="color:' + step.color + '">' +
          step.fn +
        '</div>' +
      '</div>';
    }).join('');

    bodyHtml += '<div class="tl-lane">' +
      '<div class="tl-lane-label" style="color:' + lane.color + '">' + lane.label + '</div>' +
      '<div class="tl-lane-body">' + nodesHtml + '</div>' +
    '</div>';
  });

  /* draw arrows between consecutive steps */
  /* arrows go: step i → step i+1 */
  for (var i = 0; i < TL_STEPS.length - 1; i++) {
    var s  = TL_STEPS[i];
    var s2 = TL_STEPS[i + 1];
    var x1 = s.col  * TL_COL_W + TL_COL_W / 2 + 36 - 4; /* right edge of node */
    var y1 = s.lane  * TL_LANE_H + TL_LANE_H / 2;
    var x2 = s2.col * TL_COL_W + TL_COL_W / 2 - 36 + 4; /* left edge of next */
    var y2 = s2.lane * TL_LANE_H + TL_LANE_H / 2;

    var isSameLane = s.lane === s2.lane;
    var col = (i === 0) ? '#00DDB3' : TL_STEPS[i].color;

    if (isSameLane) {
      /* straight horizontal */
      svgArrows += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
        '" stroke="' + col + '" stroke-width="1.5" opacity=".5" stroke-dasharray="4,3" marker-end="url(#tl-arr)"/>';
    } else {
      /* curved bezier crossing lanes */
      var mx = (x1 + x2) / 2;
      svgArrows += '<path d="M' + x1 + ',' + y1 + ' C' + mx + ',' + y1 + ' ' + mx + ',' + y2 + ' ' + x2 + ',' + y2 + '"' +
        ' fill="none" stroke="' + col + '" stroke-width="1.5" opacity=".45" stroke-dasharray="4,3" marker-end="url(#tl-arr)"/>';
    }
  }

  /* sequence numbers along top */
  var svgNums = '';
  TL_STEPS.forEach(function(step) {
    var cx = step.col * TL_COL_W + TL_COL_W / 2;
    var cy = step.lane * TL_LANE_H + TL_LANE_H / 2;
    svgNums += '<circle cx="' + cx + '" cy="' + cy + '" r="14" fill="' + step.color + '" opacity=".08"/>';
  });

  bodyHtml += '<svg class="tl-svg-overlay" style="width:' + svgW + 'px;height:' + svgH + 'px">' +
    '<defs>' +
      '<marker id="tl-arr" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">' +
        '<polygon points="0 0, 7 2.5, 0 5" fill="#8AADCC" opacity=".7"/>' +
      '</marker>' +
    '</defs>' +
    svgNums + svgArrows +
  '</svg>';

  bodyHtml += '</div></div>'; /* tl-lanes + tl-outer */

  wrap.innerHTML = headHtml + bodyHtml;
}

function tlClickStep(id) {
  var step = TL_STEPS[id];
  if (!step) return;

  /* toggle */
  if (activeTlStep === id) {
    activeTlStep = -1;
    document.querySelectorAll('.tl-node').forEach(function(n) { n.classList.remove('active'); });
    var det = document.getElementById('tl-detail');
    if (det) det.classList.remove('show');
    return;
  }

  activeTlStep = id;
  document.querySelectorAll('.tl-node').forEach(function(n) { n.classList.remove('active'); });
  var nd = document.getElementById('tln' + id);
  if (nd) nd.classList.add('active');

  /* build detail */
  var calls = step.calls.map(function(c, i) {
    var indent = c.depth > 0 ? 'margin-left:' + (c.depth * 16) + 'px;' : '';
    var retCls = (c.ret === '1|-1' || c.ret === '-1' || c.ret === 'NULL') ? 'tl-ret-err' : 'tl-ret-ok';
    return '<div class="tl-call-item" style="' + indent + 'animation-delay:' + (i * 0.06) + 's">' +
      (c.depth > 0 ? '<span class="tl-ci-arrow">↳</span>' : '<span style="color:var(--text3);font-size:11px">' + (i+1) + '.</span>') +
      '<span class="tl-ci-fn">' + c.fn + '</span>' +
      '<span class="tl-ci-ret ' + retCls + '">' + c.ret + '</span>' +
    '</div>';
  }).join('');

  var badgeMap = { 'in':'tl-io-in', 'ok':'tl-io-out', 'err':'tl-io-out', 'mem':'tl-io-mem', 'sys':'tl-io-sys' };
  var ioHtml = function(items) {
    return items.map(function(item) {
      return '<div class="tl-io-row">' +
        '<span class="tl-io-badge ' + (badgeMap[item.badge] || 'tl-io-in') + '">' + item.badge + '</span>' +
        '<span>' + item.text + '</span>' +
      '</div>';
    }).join('');
  };

  var det = document.getElementById('tl-detail');
  if (!det) return;
  det.innerHTML =
    '<div class="tl-detail-header">' +
      '<div class="tl-detail-step" style="background:' + step.color + '20;color:' + step.color + ';border:2px solid ' + step.color + '">' + (id+1) + '</div>' +
      '<div>' +
        '<div class="tl-detail-title">' + step.fn + '</div>' +
        '<div style="font-size:12px;color:var(--text2);margin-top:2px">' + step.desc + '</div>' +
      '</div>' +
      '<span class="tl-detail-file">' + step.file + '</span>' +
      '<button class="tl-detail-close" onclick="tlClickStep(' + id + ')">✕ fechar</button>' +
    '</div>' +
    '<div class="tl-detail-body">' +
      '<div class="tl-detail-left">' +
        '<div class="tl-detail-label">CADEIA DE CHAMADAS</div>' +
        '<div class="tl-call-chain">' + calls + '</div>' +
      '</div>' +
      '<div class="tl-detail-right">' +
        '<div class="tl-detail-label">ENTRADAS</div>' +
        ioHtml(step.inputs) +
        '<div class="tl-detail-label" style="margin-top:16px">SAÍDAS</div>' +
        ioHtml(step.outputs) +
      '</div>' +
    '</div>';
  det.classList.add('show');

  /* scroll into view */
  setTimeout(function() {
    det.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 50);
}

function runTlDemo() {
  var v = document.getElementById('tl-inp').value.trim();
  var badge = document.getElementById('tl-result-badge');
  if (!v || !/^\d+$/.test(v)) {
    badge.classList.remove('show');
    return;
  }
  try {
    var w = numToWords(v);
    if (w) {
      badge.querySelector('.tl-result-text').textContent = v + '  →  ' + w;
      badge.classList.add('show');
    }
  } catch(e) { badge.classList.remove('show'); }
}

/* ════════════════════════════════════════════════════════════
   5. INIT
   ════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function() {
  buildFiles();
  buildFlow();
  buildFunctions();
  buildDict();
  buildMake();
  buildQuiz();
  buildArchDiagram();
  buildMemDiagram();
  buildTimeline();

  /* input listeners */
  var demoInp = document.getElementById('demo-inp');
  if (demoInp) demoInp.addEventListener('input', runDemo);

  var traceInp = document.getElementById('trace-inp');
  if (traceInp) traceInp.addEventListener('input', updateTrace);

  var tlInp = document.getElementById('tl-inp');
  if (tlInp) tlInp.addEventListener('input', runTlDemo);

  var dictSearch = document.getElementById('dict-search');
  if (dictSearch) dictSearch.addEventListener('input', function() { window.dictSearchFn && window.dictSearchFn(); });

  /* expose globally */
  window.showPage      = showPage;
  window.runDemo       = runDemo;
  window.updateTrace   = updateTrace;
  window.dictSearchFn  = dictSearch;
  window.dictSearch    = dictSearch;
  window.toggleFn      = toggleFn;
  window.filterFns     = filterFns;
  window.copyCode      = copyCode;
  window.showDictTrace = showDictTrace;
  window.toggleFlow    = toggleFlow;
  window.toggleMake    = toggleMake;
  window.answerQ       = answerQ;
  window.nextQ         = nextQ;
  window.tlClickStep   = tlClickStep;
  window.runTlDemo     = runTlDemo;
});