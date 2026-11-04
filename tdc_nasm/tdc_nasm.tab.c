/* A Bison parser, made by GNU Bison 3.8.2.  */

/* Bison implementation for Yacc-like parsers in C

   Copyright (C) 1984, 1989-1990, 2000-2015, 2018-2021 Free Software Foundation,
   Inc.

   This program is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with this program.  If not, see <https://www.gnu.org/licenses/>.  */

/* As a special exception, you may create a larger work that contains
   part or all of the Bison parser skeleton and distribute that work
   under terms of your choice, so long as that work isn't itself a
   parser generator using the skeleton or a modified version thereof
   as a parser skeleton.  Alternatively, if you modify or redistribute
   the parser skeleton itself, you may (at your option) remove this
   special exception, which will cause the skeleton and the resulting
   Bison output files to be licensed under the GNU General Public
   License without this special exception.

   This special exception was added by the Free Software Foundation in
   version 2.2 of Bison.  */

/* C LALR(1) parser skeleton written by Richard Stallman, by
   simplifying the original so-called "semantic" parser.  */

/* DO NOT RELY ON FEATURES THAT ARE NOT DOCUMENTED in the manual,
   especially those whose name start with YY_ or yy_.  They are
   private implementation details that can be changed or removed.  */

/* All symbols defined below should begin with yy or YY, to avoid
   infringing on user name space.  This should be done even for local
   variables, as they might otherwise be expanded by user macros.
   There are some unavoidable exceptions within include files to
   define necessary library symbols; they are noted "INFRINGES ON
   USER NAME SPACE" below.  */

/* Identify Bison output, and Bison version.  */
#define YYBISON 30802

/* Bison version string.  */
#define YYBISON_VERSION "3.8.2"

/* Skeleton name.  */
#define YYSKELETON_NAME "yacc.c"

/* Pure parsers.  */
#define YYPURE 0

/* Push parsers.  */
#define YYPUSH 0

/* Pull parsers.  */
#define YYPULL 1




/* First part of user prologue.  */
#line 1 "tdc_nasm/tdc_nasm.y"

#include <stdio.h>
#include <string.h>
#include <stdarg.h>

int yylex(void);
void yyerror(const char *mensaje);
int buscarSimbolo(const char *nombre);
int registrarSimbolo(const char *nombre);
int declararVariable(const char *nombre);
int registrarEtiqueta(const char *nombre, int definir);
int validarSimbolos(void);
int numeroValido(const char *texto);
int emitir(const char *formato, ...);
int agregarOperacion(int destino, const char *a, const char *op, const char *b);
void escribirRutinas(void);

static char simbolos[4096][128];
static int declarados[4096];
static int definidos[4096];
static int usados[4096];
static int cantidadSimbolos = 0;
static char etiquetas[4096][128];
static int etiquetasDefinidas[4096];
static int cantidadEtiquetas = 0;
static char codigo[1024 * 1024];
static size_t longitudCodigo = 0;
static int siguienteOperacion = 1;

#line 101 "tdc_nasm/tdc_nasm.tab.c"

# ifndef YY_CAST
#  ifdef __cplusplus
#   define YY_CAST(Type, Val) static_cast<Type> (Val)
#   define YY_REINTERPRET_CAST(Type, Val) reinterpret_cast<Type> (Val)
#  else
#   define YY_CAST(Type, Val) ((Type) (Val))
#   define YY_REINTERPRET_CAST(Type, Val) ((Type) (Val))
#  endif
# endif
# ifndef YY_NULLPTR
#  if defined __cplusplus
#   if 201103L <= __cplusplus
#    define YY_NULLPTR nullptr
#   else
#    define YY_NULLPTR 0
#   endif
#  else
#   define YY_NULLPTR ((void*)0)
#  endif
# endif

#include "tdc_nasm.tab.h"
/* Symbol kind.  */
enum yysymbol_kind_t
{
  YYSYMBOL_YYEMPTY = -2,
  YYSYMBOL_YYEOF = 0,                      /* "end of file"  */
  YYSYMBOL_YYerror = 1,                    /* error  */
  YYSYMBOL_YYUNDEF = 2,                    /* "invalid token"  */
  YYSYMBOL_MAIN = 3,                       /* MAIN  */
  YYSYMBOL_VAR = 4,                        /* VAR  */
  YYSYMBOL_DOS_PUNTOS = 5,                 /* DOS_PUNTOS  */
  YYSYMBOL_IGUAL = 6,                      /* IGUAL  */
  YYSYMBOL_PYC = 7,                        /* PYC  */
  YYSYMBOL_INVALIDO = 8,                   /* INVALIDO  */
  YYSYMBOL_RESTA = 9,                      /* RESTA  */
  YYSYMBOL_GOTO = 10,                      /* GOTO  */
  YYSYMBOL_IFZ = 11,                       /* IFZ  */
  YYSYMBOL_IFNZ = 12,                      /* IFNZ  */
  YYSYMBOL_CALL = 13,                      /* CALL  */
  YYSYMBOL_INPUT = 14,                     /* INPUT  */
  YYSYMBOL_OUTPUT = 15,                    /* OUTPUT  */
  YYSYMBOL_PUSH = 16,                      /* PUSH  */
  YYSYMBOL_POP = 17,                       /* POP  */
  YYSYMBOL_VARIABLE = 18,                  /* VARIABLE  */
  YYSYMBOL_TEMPORAL = 19,                  /* TEMPORAL  */
  YYSYMBOL_ETIQUETA = 20,                  /* ETIQUETA  */
  YYSYMBOL_NUMERO = 21,                    /* NUMERO  */
  YYSYMBOL_OPERADOR = 22,                  /* OPERADOR  */
  YYSYMBOL_YYACCEPT = 23,                  /* $accept  */
  YYSYMBOL_programa = 24,                  /* programa  */
  YYSYMBOL_lista_instrucciones = 25,       /* lista_instrucciones  */
  YYSYMBOL_instruccion = 26,               /* instruccion  */
  YYSYMBOL_declaracion = 27,               /* declaracion  */
  YYSYMBOL_referencia = 28,                /* referencia  */
  YYSYMBOL_asignacion = 29,                /* asignacion  */
  YYSYMBOL_valor = 30,                     /* valor  */
  YYSYMBOL_operador = 31,                  /* operador  */
  YYSYMBOL_marca = 32,                     /* marca  */
  YYSYMBOL_salto = 33,                     /* salto  */
  YYSYMBOL_lectura = 34,                   /* lectura  */
  YYSYMBOL_escritura = 35,                 /* escritura  */
  YYSYMBOL_vacio = 36                      /* vacio  */
};
typedef enum yysymbol_kind_t yysymbol_kind_t;




#ifdef short
# undef short
#endif

/* On compilers that do not define __PTRDIFF_MAX__ etc., make sure
   <limits.h> and (if available) <stdint.h> are included
   so that the code can choose integer types of a good width.  */

#ifndef __PTRDIFF_MAX__
# include <limits.h> /* INFRINGES ON USER NAME SPACE */
# if defined __STDC_VERSION__ && 199901 <= __STDC_VERSION__
#  include <stdint.h> /* INFRINGES ON USER NAME SPACE */
#  define YY_STDINT_H
# endif
#endif

/* Narrow types that promote to a signed type and that can represent a
   signed or unsigned integer of at least N bits.  In tables they can
   save space and decrease cache pressure.  Promoting to a signed type
   helps avoid bugs in integer arithmetic.  */

#ifdef __INT_LEAST8_MAX__
typedef __INT_LEAST8_TYPE__ yytype_int8;
#elif defined YY_STDINT_H
typedef int_least8_t yytype_int8;
#else
typedef signed char yytype_int8;
#endif

#ifdef __INT_LEAST16_MAX__
typedef __INT_LEAST16_TYPE__ yytype_int16;
#elif defined YY_STDINT_H
typedef int_least16_t yytype_int16;
#else
typedef short yytype_int16;
#endif

/* Work around bug in HP-UX 11.23, which defines these macros
   incorrectly for preprocessor constants.  This workaround can likely
   be removed in 2023, as HPE has promised support for HP-UX 11.23
   (aka HP-UX 11i v2) only through the end of 2022; see Table 2 of
   <https://h20195.www2.hpe.com/V2/getpdf.aspx/4AA4-7673ENW.pdf>.  */
#ifdef __hpux
# undef UINT_LEAST8_MAX
# undef UINT_LEAST16_MAX
# define UINT_LEAST8_MAX 255
# define UINT_LEAST16_MAX 65535
#endif

#if defined __UINT_LEAST8_MAX__ && __UINT_LEAST8_MAX__ <= __INT_MAX__
typedef __UINT_LEAST8_TYPE__ yytype_uint8;
#elif (!defined __UINT_LEAST8_MAX__ && defined YY_STDINT_H \
       && UINT_LEAST8_MAX <= INT_MAX)
typedef uint_least8_t yytype_uint8;
#elif !defined __UINT_LEAST8_MAX__ && UCHAR_MAX <= INT_MAX
typedef unsigned char yytype_uint8;
#else
typedef short yytype_uint8;
#endif

#if defined __UINT_LEAST16_MAX__ && __UINT_LEAST16_MAX__ <= __INT_MAX__
typedef __UINT_LEAST16_TYPE__ yytype_uint16;
#elif (!defined __UINT_LEAST16_MAX__ && defined YY_STDINT_H \
       && UINT_LEAST16_MAX <= INT_MAX)
typedef uint_least16_t yytype_uint16;
#elif !defined __UINT_LEAST16_MAX__ && USHRT_MAX <= INT_MAX
typedef unsigned short yytype_uint16;
#else
typedef int yytype_uint16;
#endif

#ifndef YYPTRDIFF_T
# if defined __PTRDIFF_TYPE__ && defined __PTRDIFF_MAX__
#  define YYPTRDIFF_T __PTRDIFF_TYPE__
#  define YYPTRDIFF_MAXIMUM __PTRDIFF_MAX__
# elif defined PTRDIFF_MAX
#  ifndef ptrdiff_t
#   include <stddef.h> /* INFRINGES ON USER NAME SPACE */
#  endif
#  define YYPTRDIFF_T ptrdiff_t
#  define YYPTRDIFF_MAXIMUM PTRDIFF_MAX
# else
#  define YYPTRDIFF_T long
#  define YYPTRDIFF_MAXIMUM LONG_MAX
# endif
#endif

#ifndef YYSIZE_T
# ifdef __SIZE_TYPE__
#  define YYSIZE_T __SIZE_TYPE__
# elif defined size_t
#  define YYSIZE_T size_t
# elif defined __STDC_VERSION__ && 199901 <= __STDC_VERSION__
#  include <stddef.h> /* INFRINGES ON USER NAME SPACE */
#  define YYSIZE_T size_t
# else
#  define YYSIZE_T unsigned
# endif
#endif

#define YYSIZE_MAXIMUM                                  \
  YY_CAST (YYPTRDIFF_T,                                 \
           (YYPTRDIFF_MAXIMUM < YY_CAST (YYSIZE_T, -1)  \
            ? YYPTRDIFF_MAXIMUM                         \
            : YY_CAST (YYSIZE_T, -1)))

#define YYSIZEOF(X) YY_CAST (YYPTRDIFF_T, sizeof (X))


/* Stored state numbers (used for stacks). */
typedef yytype_int8 yy_state_t;

/* State numbers in computations.  */
typedef int yy_state_fast_t;

#ifndef YY_
# if defined YYENABLE_NLS && YYENABLE_NLS
#  if ENABLE_NLS
#   include <libintl.h> /* INFRINGES ON USER NAME SPACE */
#   define YY_(Msgid) dgettext ("bison-runtime", Msgid)
#  endif
# endif
# ifndef YY_
#  define YY_(Msgid) Msgid
# endif
#endif


#ifndef YY_ATTRIBUTE_PURE
# if defined __GNUC__ && 2 < __GNUC__ + (96 <= __GNUC_MINOR__)
#  define YY_ATTRIBUTE_PURE __attribute__ ((__pure__))
# else
#  define YY_ATTRIBUTE_PURE
# endif
#endif

#ifndef YY_ATTRIBUTE_UNUSED
# if defined __GNUC__ && 2 < __GNUC__ + (7 <= __GNUC_MINOR__)
#  define YY_ATTRIBUTE_UNUSED __attribute__ ((__unused__))
# else
#  define YY_ATTRIBUTE_UNUSED
# endif
#endif

/* Suppress unused-variable warnings by "using" E.  */
#if ! defined lint || defined __GNUC__
# define YY_USE(E) ((void) (E))
#else
# define YY_USE(E) /* empty */
#endif

/* Suppress an incorrect diagnostic about yylval being uninitialized.  */
#if defined __GNUC__ && ! defined __ICC && 406 <= __GNUC__ * 100 + __GNUC_MINOR__
# if __GNUC__ * 100 + __GNUC_MINOR__ < 407
#  define YY_IGNORE_MAYBE_UNINITIALIZED_BEGIN                           \
    _Pragma ("GCC diagnostic push")                                     \
    _Pragma ("GCC diagnostic ignored \"-Wuninitialized\"")
# else
#  define YY_IGNORE_MAYBE_UNINITIALIZED_BEGIN                           \
    _Pragma ("GCC diagnostic push")                                     \
    _Pragma ("GCC diagnostic ignored \"-Wuninitialized\"")              \
    _Pragma ("GCC diagnostic ignored \"-Wmaybe-uninitialized\"")
# endif
# define YY_IGNORE_MAYBE_UNINITIALIZED_END      \
    _Pragma ("GCC diagnostic pop")
#else
# define YY_INITIAL_VALUE(Value) Value
#endif
#ifndef YY_IGNORE_MAYBE_UNINITIALIZED_BEGIN
# define YY_IGNORE_MAYBE_UNINITIALIZED_BEGIN
# define YY_IGNORE_MAYBE_UNINITIALIZED_END
#endif
#ifndef YY_INITIAL_VALUE
# define YY_INITIAL_VALUE(Value) /* Nothing. */
#endif

#if defined __cplusplus && defined __GNUC__ && ! defined __ICC && 6 <= __GNUC__
# define YY_IGNORE_USELESS_CAST_BEGIN                          \
    _Pragma ("GCC diagnostic push")                            \
    _Pragma ("GCC diagnostic ignored \"-Wuseless-cast\"")
# define YY_IGNORE_USELESS_CAST_END            \
    _Pragma ("GCC diagnostic pop")
#endif
#ifndef YY_IGNORE_USELESS_CAST_BEGIN
# define YY_IGNORE_USELESS_CAST_BEGIN
# define YY_IGNORE_USELESS_CAST_END
#endif


#define YY_ASSERT(E) ((void) (0 && (E)))

#if !defined yyoverflow

/* The parser invokes alloca or malloc; define the necessary symbols.  */

# ifdef YYSTACK_USE_ALLOCA
#  if YYSTACK_USE_ALLOCA
#   ifdef __GNUC__
#    define YYSTACK_ALLOC __builtin_alloca
#   elif defined __BUILTIN_VA_ARG_INCR
#    include <alloca.h> /* INFRINGES ON USER NAME SPACE */
#   elif defined _AIX
#    define YYSTACK_ALLOC __alloca
#   elif defined _MSC_VER
#    include <malloc.h> /* INFRINGES ON USER NAME SPACE */
#    define alloca _alloca
#   else
#    define YYSTACK_ALLOC alloca
#    if ! defined _ALLOCA_H && ! defined EXIT_SUCCESS
#     include <stdlib.h> /* INFRINGES ON USER NAME SPACE */
      /* Use EXIT_SUCCESS as a witness for stdlib.h.  */
#     ifndef EXIT_SUCCESS
#      define EXIT_SUCCESS 0
#     endif
#    endif
#   endif
#  endif
# endif

# ifdef YYSTACK_ALLOC
   /* Pacify GCC's 'empty if-body' warning.  */
#  define YYSTACK_FREE(Ptr) do { /* empty */; } while (0)
#  ifndef YYSTACK_ALLOC_MAXIMUM
    /* The OS might guarantee only one guard page at the bottom of the stack,
       and a page size can be as small as 4096 bytes.  So we cannot safely
       invoke alloca (N) if N exceeds 4096.  Use a slightly smaller number
       to allow for a few compiler-allocated temporary stack slots.  */
#   define YYSTACK_ALLOC_MAXIMUM 4032 /* reasonable circa 2006 */
#  endif
# else
#  define YYSTACK_ALLOC YYMALLOC
#  define YYSTACK_FREE YYFREE
#  ifndef YYSTACK_ALLOC_MAXIMUM
#   define YYSTACK_ALLOC_MAXIMUM YYSIZE_MAXIMUM
#  endif
#  if (defined __cplusplus && ! defined EXIT_SUCCESS \
       && ! ((defined YYMALLOC || defined malloc) \
             && (defined YYFREE || defined free)))
#   include <stdlib.h> /* INFRINGES ON USER NAME SPACE */
#   ifndef EXIT_SUCCESS
#    define EXIT_SUCCESS 0
#   endif
#  endif
#  ifndef YYMALLOC
#   define YYMALLOC malloc
#   if ! defined malloc && ! defined EXIT_SUCCESS
void *malloc (YYSIZE_T); /* INFRINGES ON USER NAME SPACE */
#   endif
#  endif
#  ifndef YYFREE
#   define YYFREE free
#   if ! defined free && ! defined EXIT_SUCCESS
void free (void *); /* INFRINGES ON USER NAME SPACE */
#   endif
#  endif
# endif
#endif /* !defined yyoverflow */

#if (! defined yyoverflow \
     && (! defined __cplusplus \
         || (defined YYSTYPE_IS_TRIVIAL && YYSTYPE_IS_TRIVIAL)))

/* A type that is properly aligned for any stack member.  */
union yyalloc
{
  yy_state_t yyss_alloc;
  YYSTYPE yyvs_alloc;
};

/* The size of the maximum gap between one aligned stack and the next.  */
# define YYSTACK_GAP_MAXIMUM (YYSIZEOF (union yyalloc) - 1)

/* The size of an array large to enough to hold all stacks, each with
   N elements.  */
# define YYSTACK_BYTES(N) \
     ((N) * (YYSIZEOF (yy_state_t) + YYSIZEOF (YYSTYPE)) \
      + YYSTACK_GAP_MAXIMUM)

# define YYCOPY_NEEDED 1

/* Relocate STACK from its old location to the new one.  The
   local variables YYSIZE and YYSTACKSIZE give the old and new number of
   elements in the stack, and YYPTR gives the new location of the
   stack.  Advance YYPTR to a properly aligned location for the next
   stack.  */
# define YYSTACK_RELOCATE(Stack_alloc, Stack)                           \
    do                                                                  \
      {                                                                 \
        YYPTRDIFF_T yynewbytes;                                         \
        YYCOPY (&yyptr->Stack_alloc, Stack, yysize);                    \
        Stack = &yyptr->Stack_alloc;                                    \
        yynewbytes = yystacksize * YYSIZEOF (*Stack) + YYSTACK_GAP_MAXIMUM; \
        yyptr += yynewbytes / YYSIZEOF (*yyptr);                        \
      }                                                                 \
    while (0)

#endif

#if defined YYCOPY_NEEDED && YYCOPY_NEEDED
/* Copy COUNT objects from SRC to DST.  The source and destination do
   not overlap.  */
# ifndef YYCOPY
#  if defined __GNUC__ && 1 < __GNUC__
#   define YYCOPY(Dst, Src, Count) \
      __builtin_memcpy (Dst, Src, YY_CAST (YYSIZE_T, (Count)) * sizeof (*(Src)))
#  else
#   define YYCOPY(Dst, Src, Count)              \
      do                                        \
        {                                       \
          YYPTRDIFF_T yyi;                      \
          for (yyi = 0; yyi < (Count); yyi++)   \
            (Dst)[yyi] = (Src)[yyi];            \
        }                                       \
      while (0)
#  endif
# endif
#endif /* !YYCOPY_NEEDED */

/* YYFINAL -- State number of the termination state.  */
#define YYFINAL  4
/* YYLAST -- Last index in YYTABLE.  */
#define YYLAST   51

/* YYNTOKENS -- Number of terminals.  */
#define YYNTOKENS  23
/* YYNNTS -- Number of nonterminals.  */
#define YYNNTS  14
/* YYNRULES -- Number of rules.  */
#define YYNRULES  28
/* YYNSTATES -- Number of states.  */
#define YYNSTATES  61

/* YYMAXUTOK -- Last valid token kind.  */
#define YYMAXUTOK   277


/* YYTRANSLATE(TOKEN-NUM) -- Symbol number corresponding to TOKEN-NUM
   as returned by yylex, with out-of-bounds checking.  */
#define YYTRANSLATE(YYX)                                \
  (0 <= (YYX) && (YYX) <= YYMAXUTOK                     \
   ? YY_CAST (yysymbol_kind_t, yytranslate[YYX])        \
   : YYSYMBOL_YYUNDEF)

/* YYTRANSLATE[TOKEN-NUM] -- Symbol number corresponding to TOKEN-NUM
   as returned by yylex.  */
static const yytype_int8 yytranslate[] =
{
       0,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     2,     2,     2,     2,
       2,     2,     2,     2,     2,     2,     1,     2,     3,     4,
       5,     6,     7,     8,     9,    10,    11,    12,    13,    14,
      15,    16,    17,    18,    19,    20,    21,    22
};

#if YYDEBUG
/* YYRLINE[YYN] -- Source line where rule number YYN was defined.  */
static const yytype_uint8 yyrline[] =
{
       0,    43,    43,    46,    46,    49,    49,    49,    49,    49,
      49,    52,    57,    61,    67,    71,    77,    81,    86,    92,
      93,    94,    97,   103,   107,   111,   117,   123,   128
};
#endif

/** Accessing symbol of state STATE.  */
#define YY_ACCESSING_SYMBOL(State) YY_CAST (yysymbol_kind_t, yystos[State])

#if YYDEBUG || 0
/* The user-facing name of the symbol whose (internal) number is
   YYSYMBOL.  No bounds checking.  */
static const char *yysymbol_name (yysymbol_kind_t yysymbol) YY_ATTRIBUTE_UNUSED;

/* YYTNAME[SYMBOL-NUM] -- String name of the symbol SYMBOL-NUM.
   First, the terminals, then, starting at YYNTOKENS, nonterminals.  */
static const char *const yytname[] =
{
  "\"end of file\"", "error", "\"invalid token\"", "MAIN", "VAR",
  "DOS_PUNTOS", "IGUAL", "PYC", "INVALIDO", "RESTA", "GOTO", "IFZ", "IFNZ",
  "CALL", "INPUT", "OUTPUT", "PUSH", "POP", "VARIABLE", "TEMPORAL",
  "ETIQUETA", "NUMERO", "OPERADOR", "$accept", "programa",
  "lista_instrucciones", "instruccion", "declaracion", "referencia",
  "asignacion", "valor", "operador", "marca", "salto", "lectura",
  "escritura", "vacio", YY_NULLPTR
};

static const char *
yysymbol_name (yysymbol_kind_t yysymbol)
{
  return yytname[yysymbol];
}
#endif

#define YYPACT_NINF (-10)

#define yypact_value_is_default(Yyn) \
  ((Yyn) == YYPACT_NINF)

#define YYTABLE_NINF (-1)

#define yytable_value_is_error(Yyn) \
  0

/* YYPACT[STATE-NUM] -- Index in YYTABLE of the portion describing
   STATE-NUM.  */
static const yytype_int8 yypact[] =
{
      -2,     2,     5,     6,   -10,    -9,    -6,    11,    11,     9,
      11,   -10,   -10,     8,   -10,     6,   -10,    22,   -10,   -10,
     -10,   -10,   -10,   -10,    24,    26,    13,   -10,   -10,    25,
      27,    29,    31,   -10,   -10,    11,   -10,   -10,   -10,    19,
      20,    28,    30,    -1,    34,    35,    -7,    32,   -10,   -10,
     -10,   -10,    11,   -10,   -10,    41,    42,    43,   -10,   -10,
     -10
};

/* YYDEFACT[STATE-NUM] -- Default reduction number in state STATE-NUM.
   Performed when YYTABLE does not specify something else to do.  Zero
   means the default is an error.  */
static const yytype_int8 yydefact[] =
{
       0,     0,     0,    28,     1,     0,     0,     0,     0,     0,
       0,    12,    13,     0,     2,    28,     5,     0,     6,     7,
       8,     9,    10,     4,     0,     0,     0,    16,    18,     0,
       0,     0,     0,    22,     3,     0,    11,    23,    17,     0,
       0,     0,     0,     0,     0,     0,     0,     0,    21,    14,
      20,    19,     0,    24,    25,     0,     0,     0,    26,    27,
      15
};

/* YYPGOTO[NTERM-NUM].  */
static const yytype_int8 yypgoto[] =
{
     -10,   -10,    36,   -10,   -10,     0,   -10,    -8,   -10,   -10,
     -10,   -10,   -10,   -10
};

/* YYDEFGOTO[NTERM-NUM].  */
static const yytype_int8 yydefgoto[] =
{
       0,     2,    14,    15,    16,    28,    18,    29,    52,    19,
      20,    21,    22,    23
};

/* YYTABLE[YYPACT[STATE-NUM]] -- What to do in state STATE-NUM.  If
   positive, shift that token.  If negative, reduce the rule whose
   number is the opposite.  If YYTABLE_NINF, syntax error.  */
static const yytype_int8 yytable[] =
{
      30,     1,    32,    17,    48,     4,    49,     3,    50,    24,
       5,    11,    12,    33,    25,    17,     6,     7,     8,     9,
      26,    51,    10,    31,    11,    12,    13,    43,    35,    11,
      12,    36,    27,    37,    38,    39,    41,    40,    42,    44,
      45,    53,    54,    47,    57,    46,    55,    56,    58,    59,
      60,    34
};

static const yytype_int8 yycheck[] =
{
       8,     3,    10,     3,     5,     0,     7,     5,     9,    18,
       4,    18,    19,     5,    20,    15,    10,    11,    12,    13,
       9,    22,    16,    14,    18,    19,    20,    35,     6,    18,
      19,     7,    21,     7,    21,    10,     7,    10,     7,    20,
      20,     7,     7,    13,    52,    17,    46,    15,     7,     7,
       7,    15
};

/* YYSTOS[STATE-NUM] -- The symbol kind of the accessing symbol of
   state STATE-NUM.  */
static const yytype_int8 yystos[] =
{
       0,     3,    24,     5,     0,     4,    10,    11,    12,    13,
      16,    18,    19,    20,    25,    26,    27,    28,    29,    32,
      33,    34,    35,    36,    18,    20,     9,    21,    28,    30,
      30,    14,    30,     5,    25,     6,     7,     7,    21,    10,
      10,     7,     7,    30,    20,    20,    17,    13,     5,     7,
       9,    22,    31,     7,     7,    28,    15,    30,     7,     7,
       7
};

/* YYR1[RULE-NUM] -- Symbol kind of the left-hand side of rule RULE-NUM.  */
static const yytype_int8 yyr1[] =
{
       0,    23,    24,    25,    25,    26,    26,    26,    26,    26,
      26,    27,    28,    28,    29,    29,    30,    30,    30,    31,
      31,    31,    32,    33,    33,    33,    34,    35,    36
};

/* YYR2[RULE-NUM] -- Number of symbols on the right-hand side of rule RULE-NUM.  */
static const yytype_int8 yyr2[] =
{
       0,     2,     3,     2,     1,     1,     1,     1,     1,     1,
       1,     3,     1,     1,     4,     6,     1,     2,     1,     1,
       1,     1,     2,     3,     5,     5,     6,     6,     0
};


enum { YYENOMEM = -2 };

#define yyerrok         (yyerrstatus = 0)
#define yyclearin       (yychar = YYEMPTY)

#define YYACCEPT        goto yyacceptlab
#define YYABORT         goto yyabortlab
#define YYERROR         goto yyerrorlab
#define YYNOMEM         goto yyexhaustedlab


#define YYRECOVERING()  (!!yyerrstatus)

#define YYBACKUP(Token, Value)                                    \
  do                                                              \
    if (yychar == YYEMPTY)                                        \
      {                                                           \
        yychar = (Token);                                         \
        yylval = (Value);                                         \
        YYPOPSTACK (yylen);                                       \
        yystate = *yyssp;                                         \
        goto yybackup;                                            \
      }                                                           \
    else                                                          \
      {                                                           \
        yyerror (YY_("syntax error: cannot back up")); \
        YYERROR;                                                  \
      }                                                           \
  while (0)

/* Backward compatibility with an undocumented macro.
   Use YYerror or YYUNDEF. */
#define YYERRCODE YYUNDEF


/* Enable debugging if requested.  */
#if YYDEBUG

# ifndef YYFPRINTF
#  include <stdio.h> /* INFRINGES ON USER NAME SPACE */
#  define YYFPRINTF fprintf
# endif

# define YYDPRINTF(Args)                        \
do {                                            \
  if (yydebug)                                  \
    YYFPRINTF Args;                             \
} while (0)




# define YY_SYMBOL_PRINT(Title, Kind, Value, Location)                    \
do {                                                                      \
  if (yydebug)                                                            \
    {                                                                     \
      YYFPRINTF (stderr, "%s ", Title);                                   \
      yy_symbol_print (stderr,                                            \
                  Kind, Value); \
      YYFPRINTF (stderr, "\n");                                           \
    }                                                                     \
} while (0)


/*-----------------------------------.
| Print this symbol's value on YYO.  |
`-----------------------------------*/

static void
yy_symbol_value_print (FILE *yyo,
                       yysymbol_kind_t yykind, YYSTYPE const * const yyvaluep)
{
  FILE *yyoutput = yyo;
  YY_USE (yyoutput);
  if (!yyvaluep)
    return;
  YY_IGNORE_MAYBE_UNINITIALIZED_BEGIN
  YY_USE (yykind);
  YY_IGNORE_MAYBE_UNINITIALIZED_END
}


/*---------------------------.
| Print this symbol on YYO.  |
`---------------------------*/

static void
yy_symbol_print (FILE *yyo,
                 yysymbol_kind_t yykind, YYSTYPE const * const yyvaluep)
{
  YYFPRINTF (yyo, "%s %s (",
             yykind < YYNTOKENS ? "token" : "nterm", yysymbol_name (yykind));

  yy_symbol_value_print (yyo, yykind, yyvaluep);
  YYFPRINTF (yyo, ")");
}

/*------------------------------------------------------------------.
| yy_stack_print -- Print the state stack from its BOTTOM up to its |
| TOP (included).                                                   |
`------------------------------------------------------------------*/

static void
yy_stack_print (yy_state_t *yybottom, yy_state_t *yytop)
{
  YYFPRINTF (stderr, "Stack now");
  for (; yybottom <= yytop; yybottom++)
    {
      int yybot = *yybottom;
      YYFPRINTF (stderr, " %d", yybot);
    }
  YYFPRINTF (stderr, "\n");
}

# define YY_STACK_PRINT(Bottom, Top)                            \
do {                                                            \
  if (yydebug)                                                  \
    yy_stack_print ((Bottom), (Top));                           \
} while (0)


/*------------------------------------------------.
| Report that the YYRULE is going to be reduced.  |
`------------------------------------------------*/

static void
yy_reduce_print (yy_state_t *yyssp, YYSTYPE *yyvsp,
                 int yyrule)
{
  int yylno = yyrline[yyrule];
  int yynrhs = yyr2[yyrule];
  int yyi;
  YYFPRINTF (stderr, "Reducing stack by rule %d (line %d):\n",
             yyrule - 1, yylno);
  /* The symbols being reduced.  */
  for (yyi = 0; yyi < yynrhs; yyi++)
    {
      YYFPRINTF (stderr, "   $%d = ", yyi + 1);
      yy_symbol_print (stderr,
                       YY_ACCESSING_SYMBOL (+yyssp[yyi + 1 - yynrhs]),
                       &yyvsp[(yyi + 1) - (yynrhs)]);
      YYFPRINTF (stderr, "\n");
    }
}

# define YY_REDUCE_PRINT(Rule)          \
do {                                    \
  if (yydebug)                          \
    yy_reduce_print (yyssp, yyvsp, Rule); \
} while (0)

/* Nonzero means print parse trace.  It is left uninitialized so that
   multiple parsers can coexist.  */
int yydebug;
#else /* !YYDEBUG */
# define YYDPRINTF(Args) ((void) 0)
# define YY_SYMBOL_PRINT(Title, Kind, Value, Location)
# define YY_STACK_PRINT(Bottom, Top)
# define YY_REDUCE_PRINT(Rule)
#endif /* !YYDEBUG */


/* YYINITDEPTH -- initial size of the parser's stacks.  */
#ifndef YYINITDEPTH
# define YYINITDEPTH 200
#endif

/* YYMAXDEPTH -- maximum size the stacks can grow to (effective only
   if the built-in stack extension method is used).

   Do not make this value too large; the results are undefined if
   YYSTACK_ALLOC_MAXIMUM < YYSTACK_BYTES (YYMAXDEPTH)
   evaluated with infinite-precision integer arithmetic.  */

#ifndef YYMAXDEPTH
# define YYMAXDEPTH 10000
#endif






/*-----------------------------------------------.
| Release the memory associated to this symbol.  |
`-----------------------------------------------*/

static void
yydestruct (const char *yymsg,
            yysymbol_kind_t yykind, YYSTYPE *yyvaluep)
{
  YY_USE (yyvaluep);
  if (!yymsg)
    yymsg = "Deleting";
  YY_SYMBOL_PRINT (yymsg, yykind, yyvaluep, yylocationp);

  YY_IGNORE_MAYBE_UNINITIALIZED_BEGIN
  YY_USE (yykind);
  YY_IGNORE_MAYBE_UNINITIALIZED_END
}


/* Lookahead token kind.  */
int yychar;

/* The semantic value of the lookahead symbol.  */
YYSTYPE yylval;
/* Number of syntax errors so far.  */
int yynerrs;




/*----------.
| yyparse.  |
`----------*/

int
yyparse (void)
{
    yy_state_fast_t yystate = 0;
    /* Number of tokens to shift before error messages enabled.  */
    int yyerrstatus = 0;

    /* Refer to the stacks through separate pointers, to allow yyoverflow
       to reallocate them elsewhere.  */

    /* Their size.  */
    YYPTRDIFF_T yystacksize = YYINITDEPTH;

    /* The state stack: array, bottom, top.  */
    yy_state_t yyssa[YYINITDEPTH];
    yy_state_t *yyss = yyssa;
    yy_state_t *yyssp = yyss;

    /* The semantic value stack: array, bottom, top.  */
    YYSTYPE yyvsa[YYINITDEPTH];
    YYSTYPE *yyvs = yyvsa;
    YYSTYPE *yyvsp = yyvs;

  int yyn;
  /* The return value of yyparse.  */
  int yyresult;
  /* Lookahead symbol kind.  */
  yysymbol_kind_t yytoken = YYSYMBOL_YYEMPTY;
  /* The variables used to return semantic value and location from the
     action routines.  */
  YYSTYPE yyval;



#define YYPOPSTACK(N)   (yyvsp -= (N), yyssp -= (N))

  /* The number of symbols on the RHS of the reduced rule.
     Keep to zero when no symbol should be popped.  */
  int yylen = 0;

  YYDPRINTF ((stderr, "Starting parse\n"));

  yychar = YYEMPTY; /* Cause a token to be read.  */

  goto yysetstate;


/*------------------------------------------------------------.
| yynewstate -- push a new state, which is found in yystate.  |
`------------------------------------------------------------*/
yynewstate:
  /* In all cases, when you get here, the value and location stacks
     have just been pushed.  So pushing a state here evens the stacks.  */
  yyssp++;


/*--------------------------------------------------------------------.
| yysetstate -- set current state (the top of the stack) to yystate.  |
`--------------------------------------------------------------------*/
yysetstate:
  YYDPRINTF ((stderr, "Entering state %d\n", yystate));
  YY_ASSERT (0 <= yystate && yystate < YYNSTATES);
  YY_IGNORE_USELESS_CAST_BEGIN
  *yyssp = YY_CAST (yy_state_t, yystate);
  YY_IGNORE_USELESS_CAST_END
  YY_STACK_PRINT (yyss, yyssp);

  if (yyss + yystacksize - 1 <= yyssp)
#if !defined yyoverflow && !defined YYSTACK_RELOCATE
    YYNOMEM;
#else
    {
      /* Get the current used size of the three stacks, in elements.  */
      YYPTRDIFF_T yysize = yyssp - yyss + 1;

# if defined yyoverflow
      {
        /* Give user a chance to reallocate the stack.  Use copies of
           these so that the &'s don't force the real ones into
           memory.  */
        yy_state_t *yyss1 = yyss;
        YYSTYPE *yyvs1 = yyvs;

        /* Each stack pointer address is followed by the size of the
           data in use in that stack, in bytes.  This used to be a
           conditional around just the two extra args, but that might
           be undefined if yyoverflow is a macro.  */
        yyoverflow (YY_("memory exhausted"),
                    &yyss1, yysize * YYSIZEOF (*yyssp),
                    &yyvs1, yysize * YYSIZEOF (*yyvsp),
                    &yystacksize);
        yyss = yyss1;
        yyvs = yyvs1;
      }
# else /* defined YYSTACK_RELOCATE */
      /* Extend the stack our own way.  */
      if (YYMAXDEPTH <= yystacksize)
        YYNOMEM;
      yystacksize *= 2;
      if (YYMAXDEPTH < yystacksize)
        yystacksize = YYMAXDEPTH;

      {
        yy_state_t *yyss1 = yyss;
        union yyalloc *yyptr =
          YY_CAST (union yyalloc *,
                   YYSTACK_ALLOC (YY_CAST (YYSIZE_T, YYSTACK_BYTES (yystacksize))));
        if (! yyptr)
          YYNOMEM;
        YYSTACK_RELOCATE (yyss_alloc, yyss);
        YYSTACK_RELOCATE (yyvs_alloc, yyvs);
#  undef YYSTACK_RELOCATE
        if (yyss1 != yyssa)
          YYSTACK_FREE (yyss1);
      }
# endif

      yyssp = yyss + yysize - 1;
      yyvsp = yyvs + yysize - 1;

      YY_IGNORE_USELESS_CAST_BEGIN
      YYDPRINTF ((stderr, "Stack size increased to %ld\n",
                  YY_CAST (long, yystacksize)));
      YY_IGNORE_USELESS_CAST_END

      if (yyss + yystacksize - 1 <= yyssp)
        YYABORT;
    }
#endif /* !defined yyoverflow && !defined YYSTACK_RELOCATE */


  if (yystate == YYFINAL)
    YYACCEPT;

  goto yybackup;


/*-----------.
| yybackup.  |
`-----------*/
yybackup:
  /* Do appropriate processing given the current state.  Read a
     lookahead token if we need one and don't already have one.  */

  /* First try to decide what to do without reference to lookahead token.  */
  yyn = yypact[yystate];
  if (yypact_value_is_default (yyn))
    goto yydefault;

  /* Not known => get a lookahead token if don't already have one.  */

  /* YYCHAR is either empty, or end-of-input, or a valid lookahead.  */
  if (yychar == YYEMPTY)
    {
      YYDPRINTF ((stderr, "Reading a token\n"));
      yychar = yylex ();
    }

  if (yychar <= YYEOF)
    {
      yychar = YYEOF;
      yytoken = YYSYMBOL_YYEOF;
      YYDPRINTF ((stderr, "Now at end of input.\n"));
    }
  else if (yychar == YYerror)
    {
      /* The scanner already issued an error message, process directly
         to error recovery.  But do not keep the error token as
         lookahead, it is too special and may lead us to an endless
         loop in error recovery. */
      yychar = YYUNDEF;
      yytoken = YYSYMBOL_YYerror;
      goto yyerrlab1;
    }
  else
    {
      yytoken = YYTRANSLATE (yychar);
      YY_SYMBOL_PRINT ("Next token is", yytoken, &yylval, &yylloc);
    }

  /* If the proper action on seeing token YYTOKEN is to reduce or to
     detect an error, take that action.  */
  yyn += yytoken;
  if (yyn < 0 || YYLAST < yyn || yycheck[yyn] != yytoken)
    goto yydefault;
  yyn = yytable[yyn];
  if (yyn <= 0)
    {
      if (yytable_value_is_error (yyn))
        goto yyerrlab;
      yyn = -yyn;
      goto yyreduce;
    }

  /* Count tokens shifted since error; after three, turn off error
     status.  */
  if (yyerrstatus)
    yyerrstatus--;

  /* Shift the lookahead token.  */
  YY_SYMBOL_PRINT ("Shifting", yytoken, &yylval, &yylloc);
  yystate = yyn;
  YY_IGNORE_MAYBE_UNINITIALIZED_BEGIN
  *++yyvsp = yylval;
  YY_IGNORE_MAYBE_UNINITIALIZED_END

  /* Discard the shifted token.  */
  yychar = YYEMPTY;
  goto yynewstate;


/*-----------------------------------------------------------.
| yydefault -- do the default action for the current state.  |
`-----------------------------------------------------------*/
yydefault:
  yyn = yydefact[yystate];
  if (yyn == 0)
    goto yyerrlab;
  goto yyreduce;


/*-----------------------------.
| yyreduce -- do a reduction.  |
`-----------------------------*/
yyreduce:
  /* yyn is the number of a rule to reduce with.  */
  yylen = yyr2[yyn];

  /* If YYLEN is nonzero, implement the default value of the action:
     '$$ = $1'.

     Otherwise, the following line sets YYVAL to garbage.
     This behavior is undocumented and Bison
     users should not rely upon it.  Assigning to YYVAL
     unconditionally makes the parser a bit smaller, and it avoids a
     GCC warning that YYVAL may be used uninitialized.  */
  yyval = yyvsp[1-yylen];


  YY_REDUCE_PRINT (yyn);
  switch (yyn)
    {
  case 11: /* declaracion: VAR VARIABLE PYC  */
#line 52 "tdc_nasm/tdc_nasm.y"
                              {
    if (!declararVariable((yyvsp[-1].cadena))) YYABORT;
}
#line 1155 "tdc_nasm/tdc_nasm.tab.c"
    break;

  case 12: /* referencia: VARIABLE  */
#line 57 "tdc_nasm/tdc_nasm.y"
                     {
    (yyval.indice) = registrarSimbolo((yyvsp[0].cadena));
    if ((yyval.indice) < 0) YYABORT;
}
#line 1164 "tdc_nasm/tdc_nasm.tab.c"
    break;

  case 13: /* referencia: TEMPORAL  */
#line 61 "tdc_nasm/tdc_nasm.y"
           {
    (yyval.indice) = registrarSimbolo((yyvsp[0].cadena));
    if ((yyval.indice) < 0) YYABORT;
}
#line 1173 "tdc_nasm/tdc_nasm.tab.c"
    break;

  case 14: /* asignacion: referencia IGUAL valor PYC  */
#line 67 "tdc_nasm/tdc_nasm.y"
                                       {
    definidos[(yyvsp[-3].indice)] = 1;
    if (!emitir("    mov eax, %s\n    mov [bml_v%d], eax\n", (yyvsp[-1].cadena), (yyvsp[-3].indice))) YYABORT;
}
#line 1182 "tdc_nasm/tdc_nasm.tab.c"
    break;

  case 15: /* asignacion: referencia IGUAL valor operador valor PYC  */
#line 71 "tdc_nasm/tdc_nasm.y"
                                            {
    definidos[(yyvsp[-5].indice)] = 1;
    if (!agregarOperacion((yyvsp[-5].indice), (yyvsp[-3].cadena), (yyvsp[-2].cadena), (yyvsp[-1].cadena))) YYABORT;
}
#line 1191 "tdc_nasm/tdc_nasm.tab.c"
    break;

  case 16: /* valor: NUMERO  */
#line 77 "tdc_nasm/tdc_nasm.y"
              {
    if (!numeroValido((yyvsp[0].cadena))) { yyerror("numero fuera del rango de 32 bits"); YYABORT; }
    strcpy((yyval.cadena), (yyvsp[0].cadena));
}
#line 1200 "tdc_nasm/tdc_nasm.tab.c"
    break;

  case 17: /* valor: RESTA NUMERO  */
#line 81 "tdc_nasm/tdc_nasm.y"
               {
    if (strlen((yyvsp[0].cadena)) + 1 >= sizeof((yyval.cadena))) { yyerror("numero demasiado largo"); YYABORT; }
    (yyval.cadena)[0] = '-'; strcpy((yyval.cadena) + 1, (yyvsp[0].cadena));
    if (!numeroValido((yyval.cadena))) { yyerror("numero fuera del rango de 32 bits"); YYABORT; }
}
#line 1210 "tdc_nasm/tdc_nasm.tab.c"
    break;

  case 18: /* valor: referencia  */
#line 86 "tdc_nasm/tdc_nasm.y"
             {
    usados[(yyvsp[0].indice)] = 1;
    sprintf((yyval.cadena), "[bml_v%d]", (yyvsp[0].indice));
}
#line 1219 "tdc_nasm/tdc_nasm.tab.c"
    break;

  case 19: /* operador: OPERADOR  */
#line 92 "tdc_nasm/tdc_nasm.y"
                   { strcpy((yyval.cadena), (yyvsp[0].cadena)); }
#line 1225 "tdc_nasm/tdc_nasm.tab.c"
    break;

  case 20: /* operador: RESTA  */
#line 93 "tdc_nasm/tdc_nasm.y"
        { strcpy((yyval.cadena), "-"); }
#line 1231 "tdc_nasm/tdc_nasm.tab.c"
    break;

  case 21: /* operador: DOS_PUNTOS  */
#line 94 "tdc_nasm/tdc_nasm.y"
             { strcpy((yyval.cadena), ":"); }
#line 1237 "tdc_nasm/tdc_nasm.tab.c"
    break;

  case 22: /* marca: ETIQUETA DOS_PUNTOS  */
#line 97 "tdc_nasm/tdc_nasm.y"
                           {
    if (!registrarEtiqueta((yyvsp[-1].cadena), 1)) YYABORT;
    if (!emitir("bml_%s:\n", (yyvsp[-1].cadena))) YYABORT;
}
#line 1246 "tdc_nasm/tdc_nasm.tab.c"
    break;

  case 23: /* salto: GOTO ETIQUETA PYC  */
#line 103 "tdc_nasm/tdc_nasm.y"
                         {
    if (!registrarEtiqueta((yyvsp[-1].cadena), 0)) YYABORT;
    if (!emitir("    jmp bml_%s\n", (yyvsp[-1].cadena))) YYABORT;
}
#line 1255 "tdc_nasm/tdc_nasm.tab.c"
    break;

  case 24: /* salto: IFZ valor GOTO ETIQUETA PYC  */
#line 107 "tdc_nasm/tdc_nasm.y"
                              {
    if (!registrarEtiqueta((yyvsp[-1].cadena), 0)) YYABORT;
    if (!emitir("    mov eax, %s\n    test eax, eax\n    jz bml_%s\n", (yyvsp[-3].cadena), (yyvsp[-1].cadena))) YYABORT;
}
#line 1264 "tdc_nasm/tdc_nasm.tab.c"
    break;

  case 25: /* salto: IFNZ valor GOTO ETIQUETA PYC  */
#line 111 "tdc_nasm/tdc_nasm.y"
                               {
    if (!registrarEtiqueta((yyvsp[-1].cadena), 0)) YYABORT;
    if (!emitir("    mov eax, %s\n    test eax, eax\n    jnz bml_%s\n", (yyvsp[-3].cadena), (yyvsp[-1].cadena))) YYABORT;
}
#line 1273 "tdc_nasm/tdc_nasm.tab.c"
    break;

  case 26: /* lectura: CALL INPUT PYC POP referencia PYC  */
#line 117 "tdc_nasm/tdc_nasm.y"
                                           {
    definidos[(yyvsp[-1].indice)] = 1;
    if (!emitir("    call bml_input\n    mov [bml_v%d], eax\n", (yyvsp[-1].indice))) YYABORT;
}
#line 1282 "tdc_nasm/tdc_nasm.tab.c"
    break;

  case 27: /* escritura: PUSH valor PYC CALL OUTPUT PYC  */
#line 123 "tdc_nasm/tdc_nasm.y"
                                          {
    if (!emitir("    mov eax, %s\n    call bml_output\n", (yyvsp[-4].cadena))) YYABORT;
}
#line 1290 "tdc_nasm/tdc_nasm.tab.c"
    break;


#line 1294 "tdc_nasm/tdc_nasm.tab.c"

      default: break;
    }
  /* User semantic actions sometimes alter yychar, and that requires
     that yytoken be updated with the new translation.  We take the
     approach of translating immediately before every use of yytoken.
     One alternative is translating here after every semantic action,
     but that translation would be missed if the semantic action invokes
     YYABORT, YYACCEPT, or YYERROR immediately after altering yychar or
     if it invokes YYBACKUP.  In the case of YYABORT or YYACCEPT, an
     incorrect destructor might then be invoked immediately.  In the
     case of YYERROR or YYBACKUP, subsequent parser actions might lead
     to an incorrect destructor call or verbose syntax error message
     before the lookahead is translated.  */
  YY_SYMBOL_PRINT ("-> $$ =", YY_CAST (yysymbol_kind_t, yyr1[yyn]), &yyval, &yyloc);

  YYPOPSTACK (yylen);
  yylen = 0;

  *++yyvsp = yyval;

  /* Now 'shift' the result of the reduction.  Determine what state
     that goes to, based on the state we popped back to and the rule
     number reduced by.  */
  {
    const int yylhs = yyr1[yyn] - YYNTOKENS;
    const int yyi = yypgoto[yylhs] + *yyssp;
    yystate = (0 <= yyi && yyi <= YYLAST && yycheck[yyi] == *yyssp
               ? yytable[yyi]
               : yydefgoto[yylhs]);
  }

  goto yynewstate;


/*--------------------------------------.
| yyerrlab -- here on detecting error.  |
`--------------------------------------*/
yyerrlab:
  /* Make sure we have latest lookahead translation.  See comments at
     user semantic actions for why this is necessary.  */
  yytoken = yychar == YYEMPTY ? YYSYMBOL_YYEMPTY : YYTRANSLATE (yychar);
  /* If not already recovering from an error, report this error.  */
  if (!yyerrstatus)
    {
      ++yynerrs;
      yyerror (YY_("syntax error"));
    }

  if (yyerrstatus == 3)
    {
      /* If just tried and failed to reuse lookahead token after an
         error, discard it.  */

      if (yychar <= YYEOF)
        {
          /* Return failure if at end of input.  */
          if (yychar == YYEOF)
            YYABORT;
        }
      else
        {
          yydestruct ("Error: discarding",
                      yytoken, &yylval);
          yychar = YYEMPTY;
        }
    }

  /* Else will try to reuse lookahead token after shifting the error
     token.  */
  goto yyerrlab1;


/*---------------------------------------------------.
| yyerrorlab -- error raised explicitly by YYERROR.  |
`---------------------------------------------------*/
yyerrorlab:
  /* Pacify compilers when the user code never invokes YYERROR and the
     label yyerrorlab therefore never appears in user code.  */
  if (0)
    YYERROR;
  ++yynerrs;

  /* Do not reclaim the symbols of the rule whose action triggered
     this YYERROR.  */
  YYPOPSTACK (yylen);
  yylen = 0;
  YY_STACK_PRINT (yyss, yyssp);
  yystate = *yyssp;
  goto yyerrlab1;


/*-------------------------------------------------------------.
| yyerrlab1 -- common code for both syntax error and YYERROR.  |
`-------------------------------------------------------------*/
yyerrlab1:
  yyerrstatus = 3;      /* Each real token shifted decrements this.  */

  /* Pop stack until we find a state that shifts the error token.  */
  for (;;)
    {
      yyn = yypact[yystate];
      if (!yypact_value_is_default (yyn))
        {
          yyn += YYSYMBOL_YYerror;
          if (0 <= yyn && yyn <= YYLAST && yycheck[yyn] == YYSYMBOL_YYerror)
            {
              yyn = yytable[yyn];
              if (0 < yyn)
                break;
            }
        }

      /* Pop the current state because it cannot handle the error token.  */
      if (yyssp == yyss)
        YYABORT;


      yydestruct ("Error: popping",
                  YY_ACCESSING_SYMBOL (yystate), yyvsp);
      YYPOPSTACK (1);
      yystate = *yyssp;
      YY_STACK_PRINT (yyss, yyssp);
    }

  YY_IGNORE_MAYBE_UNINITIALIZED_BEGIN
  *++yyvsp = yylval;
  YY_IGNORE_MAYBE_UNINITIALIZED_END


  /* Shift the error token.  */
  YY_SYMBOL_PRINT ("Shifting", YY_ACCESSING_SYMBOL (yyn), yyvsp, yylsp);

  yystate = yyn;
  goto yynewstate;


/*-------------------------------------.
| yyacceptlab -- YYACCEPT comes here.  |
`-------------------------------------*/
yyacceptlab:
  yyresult = 0;
  goto yyreturnlab;


/*-----------------------------------.
| yyabortlab -- YYABORT comes here.  |
`-----------------------------------*/
yyabortlab:
  yyresult = 1;
  goto yyreturnlab;


/*-----------------------------------------------------------.
| yyexhaustedlab -- YYNOMEM (memory exhaustion) comes here.  |
`-----------------------------------------------------------*/
yyexhaustedlab:
  yyerror (YY_("memory exhausted"));
  yyresult = 2;
  goto yyreturnlab;


/*----------------------------------------------------------.
| yyreturnlab -- parsing is finished, clean up and return.  |
`----------------------------------------------------------*/
yyreturnlab:
  if (yychar != YYEMPTY)
    {
      /* Make sure we have latest lookahead translation.  See comments at
         user semantic actions for why this is necessary.  */
      yytoken = YYTRANSLATE (yychar);
      yydestruct ("Cleanup: discarding lookahead",
                  yytoken, &yylval);
    }
  /* Do not reclaim the symbols of the rule whose action triggered
     this YYABORT or YYACCEPT.  */
  YYPOPSTACK (yylen);
  YY_STACK_PRINT (yyss, yyssp);
  while (yyssp != yyss)
    {
      yydestruct ("Cleanup: popping",
                  YY_ACCESSING_SYMBOL (+*yyssp), yyvsp);
      YYPOPSTACK (1);
    }
#ifndef yyoverflow
  if (yyss != yyssa)
    YYSTACK_FREE (yyss);
#endif

  return yyresult;
}

#line 130 "tdc_nasm/tdc_nasm.y"


int buscarSimbolo(const char *nombre) {
    int i;
    for (i = 0; i < cantidadSimbolos; i++) {
        if (strcmp(simbolos[i], nombre) == 0) return i;
    }
    return -1;
}

int registrarSimbolo(const char *nombre) {
    int indice = buscarSimbolo(nombre);
    if (indice >= 0) return indice;
    if (cantidadSimbolos >= 4096) { yyerror("demasiadas variables o temporales"); return -1; }
    strcpy(simbolos[cantidadSimbolos], nombre);
    return cantidadSimbolos++;
}

int declararVariable(const char *nombre) {
    int indice = registrarSimbolo(nombre);
    if (indice < 0) return 0;
    if (declarados[indice]) { yyerror("variable declarada mas de una vez"); return 0; }
    declarados[indice] = 1;
    return 1;
}

int registrarEtiqueta(const char *nombre, int definir) {
    int i;
    for (i = 0; i < cantidadEtiquetas; i++) {
        if (strcmp(etiquetas[i], nombre) == 0) break;
    }
    if (i == cantidadEtiquetas) {
        if (cantidadEtiquetas >= 4096) { yyerror("demasiadas etiquetas"); return 0; }
        strcpy(etiquetas[cantidadEtiquetas++], nombre);
    }
    if (definir && etiquetasDefinidas[i]) { yyerror("etiqueta definida mas de una vez"); return 0; }
    if (definir) etiquetasDefinidas[i] = 1;
    return 1;
}

int validarSimbolos(void) {
    int i;
    char mensaje[256];
    for (i = 0; i < cantidadSimbolos; i++) {
        if (simbolos[i][0] == '$' && !declarados[i]) {
            sprintf(mensaje, "variable no declarada: %s", simbolos[i]);
            yyerror(mensaje); return 0;
        }
        if (simbolos[i][0] == 't' && usados[i] && !definidos[i]) {
            sprintf(mensaje, "temporal sin asignacion: %s", simbolos[i]);
            yyerror(mensaje); return 0;
        }
    }
    for (i = 0; i < cantidadEtiquetas; i++) {
        if (!etiquetasDefinidas[i]) {
            sprintf(mensaje, "etiqueta sin definir: %s", etiquetas[i]);
            yyerror(mensaje); return 0;
        }
    }
    return 1;
}

int numeroValido(const char *texto) {
    unsigned long valor = 0;
    unsigned long limite = 2147483648UL;
    if (*texto == '-') texto++;
    while (*texto) {
        unsigned long digito = (unsigned long)(*texto - '0');
        if (valor > (limite - digito) / 10) return 0;
        valor = valor * 10 + digito;
        texto++;
    }
    return 1;
}

int emitir(const char *formato, ...) {
    va_list argumentos;
    int escritos;
    size_t disponible = sizeof(codigo) - longitudCodigo;
    va_start(argumentos, formato);
    escritos = vsnprintf(codigo + longitudCodigo, disponible, formato, argumentos);
    va_end(argumentos);
    if (escritos < 0 || (size_t)escritos >= disponible) {
        yyerror("el codigo generado supera el limite de 1 MiB"); return 0;
    }
    longitudCodigo += (size_t)escritos;
    return 1;
}

int agregarOperacion(int destino, const char *a, const char *op, const char *b) {
    int numero = siguienteOperacion++;
    const char *comparacion = NULL;
    if (!emitir("    mov eax, %s\n    mov ebx, %s\n", a, b)) return 0;
    if (strcmp(op, "==") == 0) comparacion = "sete";
    else if (strcmp(op, "<>") == 0 || strcmp(op, "!=") == 0) comparacion = "setne";
    else if (strcmp(op, "<") == 0) comparacion = "setl";
    else if (strcmp(op, ">") == 0) comparacion = "setg";
    else if (strcmp(op, "<=") == 0) comparacion = "setle";
    else if (strcmp(op, ">=") == 0) comparacion = "setge";
    if (comparacion) {
        if (!emitir("    cmp eax, ebx\n    %s al\n    movzx eax, al\n", comparacion)) return 0;
    } else if (strcmp(op, "+") == 0) {
        if (!emitir("    add eax, ebx\n")) return 0;
    } else if (strcmp(op, "-") == 0) {
        if (!emitir("    sub eax, ebx\n")) return 0;
    } else if (strcmp(op, "*") == 0) {
        if (!emitir("    imul eax, ebx\n")) return 0;
    } else if (strcmp(op, "/") == 0) {
        if (!emitir("    test ebx, ebx\n    jz bml_error_division\n"
            "    cmp eax, 0x80000000\n    jne bml_div_ok_%d\n"
            "    cmp ebx, -1\n    je bml_error_division\nbml_div_ok_%d:\n"
            "    cdq\n    idiv ebx\n", numero, numero)) return 0;
    } else if (strcmp(op, ":") == 0) {
        if (!emitir("    test ebx, ebx\n    js bml_error_exponent\n"
            "    mov ecx, ebx\n    mov ebx, eax\n    mov eax, 1\n"
            "bml_pow_loop_%d:\n    test ecx, ecx\n    jz bml_pow_end_%d\n"
            "    test ecx, 1\n    jz bml_pow_square_%d\n    imul eax, ebx\n"
            "bml_pow_square_%d:\n    shr ecx, 1\n    imul ebx, ebx\n"
            "    jmp bml_pow_loop_%d\nbml_pow_end_%d:\n",
            numero, numero, numero, numero, numero, numero)) return 0;
    } else { yyerror("operador no reconocido"); return 0; }
    return emitir("    mov [bml_v%d], eax\n", destino);
}

int main(void) {
    int i;
    int resultado = yyparse();
    if (resultado != 0) return resultado;
    if (!validarSimbolos()) return 1;
    printf("BITS 32\nsection .bss\n");
    for (i = 0; i < cantidadSimbolos; i++) printf("bml_v%d resd 1\n", i);
    printf("bml_buffer resb 17\nbml_char resb 1\n");
    printf("section .data\n"
        "bml_msg_division db 'Error: division por cero o resultado fuera de rango',10\n"
        "bml_len_division equ $-bml_msg_division\n"
        "bml_msg_exponent db 'Error: exponente negativo',10\n"
        "bml_len_exponent equ $-bml_msg_exponent\n"
        "bml_msg_input db 'Error: READ requiere un entero de 32 bits',10\n"
        "bml_len_input equ $-bml_msg_input\n");
    printf("section .text\nglobal _start\n_start:\n");
    printf("%s", codigo);
    printf("    mov eax, 1\n    xor ebx, ebx\n    int 0x80\n");
    escribirRutinas();
    printf("\nsection .note.GNU-stack noalloc noexec nowrite progbits\n");
    return 0;
}

void yyerror(const char *mensaje) {
    extern int yylineno;
    extern char *yytext;
    fprintf(stderr, "Error: %s en la linea %d cerca de %s\n", mensaje, yylineno, yytext);
}

void escribirRutinas(void) {
    fputs(
        "\n"
        "bml_output:\n"
        "    pushad\n"
        "    mov esi, eax\n"
        "    mov edi, bml_buffer + 16\n"
        "    mov byte [edi], 10\n"
        "    test eax, eax\n"
        "    jns bml_output_digits\n"
        "    neg eax\n"
        "bml_output_digits:\n"
        "    mov ebx, 10\n"
        "bml_output_loop:\n"
        "    xor edx, edx\n"
        "    div ebx\n"
        "    add dl, '0'\n"
        "    dec edi\n"
        "    mov [edi], dl\n"
        "    test eax, eax\n"
        "    jnz bml_output_loop\n"
        "    test esi, esi\n"
        "    jns bml_output_write\n"
        "    dec edi\n"
        "    mov byte [edi], '-'\n"
        "bml_output_write:\n"
        "    mov ecx, edi\n"
        "    mov edx, bml_buffer + 17\n"
        "    sub edx, edi\n"
        "    mov eax, 4\n"
        "    mov ebx, 1\n"
        "    int 0x80\n"
        "    popad\n"
        "    ret\n"
        "\n"
        "bml_read_char:\n"
        "    mov eax, 3\n"
        "    xor ebx, ebx\n"
        "    mov ecx, bml_char\n"
        "    mov edx, 1\n"
        "    int 0x80\n"
        "    ret\n"
        "bml_input:\n"
        "    push ebx\n"
        "    push ecx\n"
        "    push edx\n"
        "    push esi\n"
        "    push edi\n"
        "    push ebp\n"
        "    xor esi, esi\n"
        "    xor edi, edi\n"
        "    xor ebp, ebp\n"
        "bml_input_skip:\n"
        "    call bml_read_char\n"
        "    cmp eax, 1\n"
        "    jne bml_error_input\n"
        "    mov al, [bml_char]\n"
        "    cmp al, ' '\n"
        "    je bml_input_skip\n"
        "    cmp al, 9\n"
        "    je bml_input_skip\n"
        "    cmp al, 10\n"
        "    je bml_input_skip\n"
        "    cmp al, 13\n"
        "    je bml_input_skip\n"
        "    cmp al, '-'\n"
        "    jne bml_input_plus\n"
        "    mov edi, 1\n"
        "    jmp bml_input_after_sign\n"
        "bml_input_plus:\n"
        "    cmp al, '+'\n"
        "    jne bml_input_digit\n"
        "bml_input_after_sign:\n"
        "    call bml_read_char\n"
        "    cmp eax, 1\n"
        "    jne bml_error_input\n"
        "bml_input_digit:\n"
        "    movzx edx, byte [bml_char]\n"
        "    cmp edx, '0'\n"
        "    jb bml_input_delimiter\n"
        "    cmp edx, '9'\n"
        "    ja bml_input_delimiter\n"
        "    sub edx, '0'\n"
        "    cmp esi, 214748364\n"
        "    ja bml_error_input\n"
        "    jb bml_input_accumulate\n"
        "    mov eax, 7\n"
        "    add eax, edi\n"
        "    cmp edx, eax\n"
        "    ja bml_error_input\n"
        "bml_input_accumulate:\n"
        "    imul esi, esi, 10\n"
        "    add esi, edx\n"
        "    inc ebp\n"
        "    call bml_read_char\n"
        "    cmp eax, 0\n"
        "    je bml_input_done\n"
        "    jl bml_error_input\n"
        "    jmp bml_input_digit\n"
        "bml_input_delimiter:\n"
        "    cmp edx, ' '\n"
        "    je bml_input_done\n"
        "    cmp edx, 9\n"
        "    je bml_input_done\n"
        "    cmp edx, 10\n"
        "    je bml_input_done\n"
        "    cmp edx, 13\n"
        "    jne bml_error_input\n"
        "bml_input_done:\n"
        "    test ebp, ebp\n"
        "    jz bml_error_input\n"
        "    mov eax, esi\n"
        "    test edi, edi\n"
        "    jz bml_input_return\n"
        "    neg eax\n"
        "bml_input_return:\n"
        "    pop ebp\n"
        "    pop edi\n"
        "    pop esi\n"
        "    pop edx\n"
        "    pop ecx\n"
        "    pop ebx\n"
        "    ret\n"
        "bml_error_division:\n"
        "    mov ecx, bml_msg_division\n"
        "    mov edx, bml_len_division\n"
        "    jmp bml_error\n"
        "bml_error_exponent:\n"
        "    mov ecx, bml_msg_exponent\n"
        "    mov edx, bml_len_exponent\n"
        "    jmp bml_error\n"
        "bml_error_input:\n"
        "    mov ecx, bml_msg_input\n"
        "    mov edx, bml_len_input\n"
        "bml_error:\n"
        "    mov eax, 4\n"
        "    mov ebx, 2\n"
        "    int 0x80\n"
        "    mov eax, 1\n"
        "    mov ebx, 1\n"
        "    int 0x80\n"
        , stdout);
}
