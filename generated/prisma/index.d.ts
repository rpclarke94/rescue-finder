
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Dog
 * 
 */
export type Dog = $Result.DefaultSelection<Prisma.$DogPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Dogs
 * const dogs = await prisma.dog.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Dogs
   * const dogs = await prisma.dog.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.dog`: Exposes CRUD operations for the **Dog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Dogs
    * const dogs = await prisma.dog.findMany()
    * ```
    */
  get dog(): Prisma.DogDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.16.2
   * Query Engine version: 1c57fdcd7e44b29b9313256c76699e91c3ac3c43
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Dog: 'Dog'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "dog"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Dog: {
        payload: Prisma.$DogPayload<ExtArgs>
        fields: Prisma.DogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DogPayload>
          }
          findFirst: {
            args: Prisma.DogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DogPayload>
          }
          findMany: {
            args: Prisma.DogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DogPayload>[]
          }
          create: {
            args: Prisma.DogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DogPayload>
          }
          createMany: {
            args: Prisma.DogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DogPayload>[]
          }
          delete: {
            args: Prisma.DogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DogPayload>
          }
          update: {
            args: Prisma.DogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DogPayload>
          }
          deleteMany: {
            args: Prisma.DogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DogPayload>[]
          }
          upsert: {
            args: Prisma.DogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DogPayload>
          }
          aggregate: {
            args: Prisma.DogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDog>
          }
          groupBy: {
            args: Prisma.DogGroupByArgs<ExtArgs>
            result: $Utils.Optional<DogGroupByOutputType>[]
          }
          count: {
            args: Prisma.DogCountArgs<ExtArgs>
            result: $Utils.Optional<DogCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    dog?: DogOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model Dog
   */

  export type AggregateDog = {
    _count: DogCountAggregateOutputType | null
    _avg: DogAvgAggregateOutputType | null
    _sum: DogSumAggregateOutputType | null
    _min: DogMinAggregateOutputType | null
    _max: DogMaxAggregateOutputType | null
  }

  export type DogAvgAggregateOutputType = {
    id: number | null
  }

  export type DogSumAggregateOutputType = {
    id: number | null
  }

  export type DogMinAggregateOutputType = {
    id: number | null
    externalId: string | null
    name: string | null
    imageUrl: string | null
    link: string | null
    age: string | null
    sex: string | null
    breed: string | null
    location: string | null
    county: string | null
    region: string | null
    charity: string | null
    description: string | null
    ageCategory: string | null
    seoSlug: string | null
    seoTitle: string | null
    seoDescription: string | null
    scrapedDate: Date | null
    lastSeen: Date | null
  }

  export type DogMaxAggregateOutputType = {
    id: number | null
    externalId: string | null
    name: string | null
    imageUrl: string | null
    link: string | null
    age: string | null
    sex: string | null
    breed: string | null
    location: string | null
    county: string | null
    region: string | null
    charity: string | null
    description: string | null
    ageCategory: string | null
    seoSlug: string | null
    seoTitle: string | null
    seoDescription: string | null
    scrapedDate: Date | null
    lastSeen: Date | null
  }

  export type DogCountAggregateOutputType = {
    id: number
    externalId: number
    name: number
    imageUrl: number
    link: number
    age: number
    sex: number
    breed: number
    location: number
    county: number
    region: number
    charity: number
    description: number
    ageCategory: number
    seoSlug: number
    seoTitle: number
    seoDescription: number
    scrapedDate: number
    lastSeen: number
    _all: number
  }


  export type DogAvgAggregateInputType = {
    id?: true
  }

  export type DogSumAggregateInputType = {
    id?: true
  }

  export type DogMinAggregateInputType = {
    id?: true
    externalId?: true
    name?: true
    imageUrl?: true
    link?: true
    age?: true
    sex?: true
    breed?: true
    location?: true
    county?: true
    region?: true
    charity?: true
    description?: true
    ageCategory?: true
    seoSlug?: true
    seoTitle?: true
    seoDescription?: true
    scrapedDate?: true
    lastSeen?: true
  }

  export type DogMaxAggregateInputType = {
    id?: true
    externalId?: true
    name?: true
    imageUrl?: true
    link?: true
    age?: true
    sex?: true
    breed?: true
    location?: true
    county?: true
    region?: true
    charity?: true
    description?: true
    ageCategory?: true
    seoSlug?: true
    seoTitle?: true
    seoDescription?: true
    scrapedDate?: true
    lastSeen?: true
  }

  export type DogCountAggregateInputType = {
    id?: true
    externalId?: true
    name?: true
    imageUrl?: true
    link?: true
    age?: true
    sex?: true
    breed?: true
    location?: true
    county?: true
    region?: true
    charity?: true
    description?: true
    ageCategory?: true
    seoSlug?: true
    seoTitle?: true
    seoDescription?: true
    scrapedDate?: true
    lastSeen?: true
    _all?: true
  }

  export type DogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Dog to aggregate.
     */
    where?: DogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Dogs to fetch.
     */
    orderBy?: DogOrderByWithRelationInput | DogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Dogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Dogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Dogs
    **/
    _count?: true | DogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DogMaxAggregateInputType
  }

  export type GetDogAggregateType<T extends DogAggregateArgs> = {
        [P in keyof T & keyof AggregateDog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDog[P]>
      : GetScalarType<T[P], AggregateDog[P]>
  }




  export type DogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DogWhereInput
    orderBy?: DogOrderByWithAggregationInput | DogOrderByWithAggregationInput[]
    by: DogScalarFieldEnum[] | DogScalarFieldEnum
    having?: DogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DogCountAggregateInputType | true
    _avg?: DogAvgAggregateInputType
    _sum?: DogSumAggregateInputType
    _min?: DogMinAggregateInputType
    _max?: DogMaxAggregateInputType
  }

  export type DogGroupByOutputType = {
    id: number
    externalId: string
    name: string
    imageUrl: string | null
    link: string | null
    age: string | null
    sex: string | null
    breed: string | null
    location: string | null
    county: string | null
    region: string | null
    charity: string | null
    description: string | null
    ageCategory: string | null
    seoSlug: string | null
    seoTitle: string | null
    seoDescription: string | null
    scrapedDate: Date | null
    lastSeen: Date | null
    _count: DogCountAggregateOutputType | null
    _avg: DogAvgAggregateOutputType | null
    _sum: DogSumAggregateOutputType | null
    _min: DogMinAggregateOutputType | null
    _max: DogMaxAggregateOutputType | null
  }

  type GetDogGroupByPayload<T extends DogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DogGroupByOutputType[P]>
            : GetScalarType<T[P], DogGroupByOutputType[P]>
        }
      >
    >


  export type DogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    externalId?: boolean
    name?: boolean
    imageUrl?: boolean
    link?: boolean
    age?: boolean
    sex?: boolean
    breed?: boolean
    location?: boolean
    county?: boolean
    region?: boolean
    charity?: boolean
    description?: boolean
    ageCategory?: boolean
    seoSlug?: boolean
    seoTitle?: boolean
    seoDescription?: boolean
    scrapedDate?: boolean
    lastSeen?: boolean
  }, ExtArgs["result"]["dog"]>

  export type DogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    externalId?: boolean
    name?: boolean
    imageUrl?: boolean
    link?: boolean
    age?: boolean
    sex?: boolean
    breed?: boolean
    location?: boolean
    county?: boolean
    region?: boolean
    charity?: boolean
    description?: boolean
    ageCategory?: boolean
    seoSlug?: boolean
    seoTitle?: boolean
    seoDescription?: boolean
    scrapedDate?: boolean
    lastSeen?: boolean
  }, ExtArgs["result"]["dog"]>

  export type DogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    externalId?: boolean
    name?: boolean
    imageUrl?: boolean
    link?: boolean
    age?: boolean
    sex?: boolean
    breed?: boolean
    location?: boolean
    county?: boolean
    region?: boolean
    charity?: boolean
    description?: boolean
    ageCategory?: boolean
    seoSlug?: boolean
    seoTitle?: boolean
    seoDescription?: boolean
    scrapedDate?: boolean
    lastSeen?: boolean
  }, ExtArgs["result"]["dog"]>

  export type DogSelectScalar = {
    id?: boolean
    externalId?: boolean
    name?: boolean
    imageUrl?: boolean
    link?: boolean
    age?: boolean
    sex?: boolean
    breed?: boolean
    location?: boolean
    county?: boolean
    region?: boolean
    charity?: boolean
    description?: boolean
    ageCategory?: boolean
    seoSlug?: boolean
    seoTitle?: boolean
    seoDescription?: boolean
    scrapedDate?: boolean
    lastSeen?: boolean
  }

  export type DogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "externalId" | "name" | "imageUrl" | "link" | "age" | "sex" | "breed" | "location" | "county" | "region" | "charity" | "description" | "ageCategory" | "seoSlug" | "seoTitle" | "seoDescription" | "scrapedDate" | "lastSeen", ExtArgs["result"]["dog"]>

  export type $DogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Dog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      externalId: string
      name: string
      imageUrl: string | null
      link: string | null
      age: string | null
      sex: string | null
      breed: string | null
      location: string | null
      county: string | null
      region: string | null
      charity: string | null
      description: string | null
      ageCategory: string | null
      seoSlug: string | null
      seoTitle: string | null
      seoDescription: string | null
      scrapedDate: Date | null
      lastSeen: Date | null
    }, ExtArgs["result"]["dog"]>
    composites: {}
  }

  type DogGetPayload<S extends boolean | null | undefined | DogDefaultArgs> = $Result.GetResult<Prisma.$DogPayload, S>

  type DogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DogCountAggregateInputType | true
    }

  export interface DogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Dog'], meta: { name: 'Dog' } }
    /**
     * Find zero or one Dog that matches the filter.
     * @param {DogFindUniqueArgs} args - Arguments to find a Dog
     * @example
     * // Get one Dog
     * const dog = await prisma.dog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DogFindUniqueArgs>(args: SelectSubset<T, DogFindUniqueArgs<ExtArgs>>): Prisma__DogClient<$Result.GetResult<Prisma.$DogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Dog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DogFindUniqueOrThrowArgs} args - Arguments to find a Dog
     * @example
     * // Get one Dog
     * const dog = await prisma.dog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DogFindUniqueOrThrowArgs>(args: SelectSubset<T, DogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DogClient<$Result.GetResult<Prisma.$DogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Dog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DogFindFirstArgs} args - Arguments to find a Dog
     * @example
     * // Get one Dog
     * const dog = await prisma.dog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DogFindFirstArgs>(args?: SelectSubset<T, DogFindFirstArgs<ExtArgs>>): Prisma__DogClient<$Result.GetResult<Prisma.$DogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Dog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DogFindFirstOrThrowArgs} args - Arguments to find a Dog
     * @example
     * // Get one Dog
     * const dog = await prisma.dog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DogFindFirstOrThrowArgs>(args?: SelectSubset<T, DogFindFirstOrThrowArgs<ExtArgs>>): Prisma__DogClient<$Result.GetResult<Prisma.$DogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Dogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Dogs
     * const dogs = await prisma.dog.findMany()
     * 
     * // Get first 10 Dogs
     * const dogs = await prisma.dog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dogWithIdOnly = await prisma.dog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DogFindManyArgs>(args?: SelectSubset<T, DogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Dog.
     * @param {DogCreateArgs} args - Arguments to create a Dog.
     * @example
     * // Create one Dog
     * const Dog = await prisma.dog.create({
     *   data: {
     *     // ... data to create a Dog
     *   }
     * })
     * 
     */
    create<T extends DogCreateArgs>(args: SelectSubset<T, DogCreateArgs<ExtArgs>>): Prisma__DogClient<$Result.GetResult<Prisma.$DogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Dogs.
     * @param {DogCreateManyArgs} args - Arguments to create many Dogs.
     * @example
     * // Create many Dogs
     * const dog = await prisma.dog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DogCreateManyArgs>(args?: SelectSubset<T, DogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Dogs and returns the data saved in the database.
     * @param {DogCreateManyAndReturnArgs} args - Arguments to create many Dogs.
     * @example
     * // Create many Dogs
     * const dog = await prisma.dog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Dogs and only return the `id`
     * const dogWithIdOnly = await prisma.dog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DogCreateManyAndReturnArgs>(args?: SelectSubset<T, DogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Dog.
     * @param {DogDeleteArgs} args - Arguments to delete one Dog.
     * @example
     * // Delete one Dog
     * const Dog = await prisma.dog.delete({
     *   where: {
     *     // ... filter to delete one Dog
     *   }
     * })
     * 
     */
    delete<T extends DogDeleteArgs>(args: SelectSubset<T, DogDeleteArgs<ExtArgs>>): Prisma__DogClient<$Result.GetResult<Prisma.$DogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Dog.
     * @param {DogUpdateArgs} args - Arguments to update one Dog.
     * @example
     * // Update one Dog
     * const dog = await prisma.dog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DogUpdateArgs>(args: SelectSubset<T, DogUpdateArgs<ExtArgs>>): Prisma__DogClient<$Result.GetResult<Prisma.$DogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Dogs.
     * @param {DogDeleteManyArgs} args - Arguments to filter Dogs to delete.
     * @example
     * // Delete a few Dogs
     * const { count } = await prisma.dog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DogDeleteManyArgs>(args?: SelectSubset<T, DogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Dogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Dogs
     * const dog = await prisma.dog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DogUpdateManyArgs>(args: SelectSubset<T, DogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Dogs and returns the data updated in the database.
     * @param {DogUpdateManyAndReturnArgs} args - Arguments to update many Dogs.
     * @example
     * // Update many Dogs
     * const dog = await prisma.dog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Dogs and only return the `id`
     * const dogWithIdOnly = await prisma.dog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DogUpdateManyAndReturnArgs>(args: SelectSubset<T, DogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Dog.
     * @param {DogUpsertArgs} args - Arguments to update or create a Dog.
     * @example
     * // Update or create a Dog
     * const dog = await prisma.dog.upsert({
     *   create: {
     *     // ... data to create a Dog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Dog we want to update
     *   }
     * })
     */
    upsert<T extends DogUpsertArgs>(args: SelectSubset<T, DogUpsertArgs<ExtArgs>>): Prisma__DogClient<$Result.GetResult<Prisma.$DogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Dogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DogCountArgs} args - Arguments to filter Dogs to count.
     * @example
     * // Count the number of Dogs
     * const count = await prisma.dog.count({
     *   where: {
     *     // ... the filter for the Dogs we want to count
     *   }
     * })
    **/
    count<T extends DogCountArgs>(
      args?: Subset<T, DogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Dog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DogAggregateArgs>(args: Subset<T, DogAggregateArgs>): Prisma.PrismaPromise<GetDogAggregateType<T>>

    /**
     * Group by Dog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DogGroupByArgs['orderBy'] }
        : { orderBy?: DogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Dog model
   */
  readonly fields: DogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Dog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Dog model
   */
  interface DogFieldRefs {
    readonly id: FieldRef<"Dog", 'Int'>
    readonly externalId: FieldRef<"Dog", 'String'>
    readonly name: FieldRef<"Dog", 'String'>
    readonly imageUrl: FieldRef<"Dog", 'String'>
    readonly link: FieldRef<"Dog", 'String'>
    readonly age: FieldRef<"Dog", 'String'>
    readonly sex: FieldRef<"Dog", 'String'>
    readonly breed: FieldRef<"Dog", 'String'>
    readonly location: FieldRef<"Dog", 'String'>
    readonly county: FieldRef<"Dog", 'String'>
    readonly region: FieldRef<"Dog", 'String'>
    readonly charity: FieldRef<"Dog", 'String'>
    readonly description: FieldRef<"Dog", 'String'>
    readonly ageCategory: FieldRef<"Dog", 'String'>
    readonly seoSlug: FieldRef<"Dog", 'String'>
    readonly seoTitle: FieldRef<"Dog", 'String'>
    readonly seoDescription: FieldRef<"Dog", 'String'>
    readonly scrapedDate: FieldRef<"Dog", 'DateTime'>
    readonly lastSeen: FieldRef<"Dog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Dog findUnique
   */
  export type DogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dog
     */
    select?: DogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dog
     */
    omit?: DogOmit<ExtArgs> | null
    /**
     * Filter, which Dog to fetch.
     */
    where: DogWhereUniqueInput
  }

  /**
   * Dog findUniqueOrThrow
   */
  export type DogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dog
     */
    select?: DogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dog
     */
    omit?: DogOmit<ExtArgs> | null
    /**
     * Filter, which Dog to fetch.
     */
    where: DogWhereUniqueInput
  }

  /**
   * Dog findFirst
   */
  export type DogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dog
     */
    select?: DogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dog
     */
    omit?: DogOmit<ExtArgs> | null
    /**
     * Filter, which Dog to fetch.
     */
    where?: DogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Dogs to fetch.
     */
    orderBy?: DogOrderByWithRelationInput | DogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Dogs.
     */
    cursor?: DogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Dogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Dogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Dogs.
     */
    distinct?: DogScalarFieldEnum | DogScalarFieldEnum[]
  }

  /**
   * Dog findFirstOrThrow
   */
  export type DogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dog
     */
    select?: DogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dog
     */
    omit?: DogOmit<ExtArgs> | null
    /**
     * Filter, which Dog to fetch.
     */
    where?: DogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Dogs to fetch.
     */
    orderBy?: DogOrderByWithRelationInput | DogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Dogs.
     */
    cursor?: DogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Dogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Dogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Dogs.
     */
    distinct?: DogScalarFieldEnum | DogScalarFieldEnum[]
  }

  /**
   * Dog findMany
   */
  export type DogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dog
     */
    select?: DogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dog
     */
    omit?: DogOmit<ExtArgs> | null
    /**
     * Filter, which Dogs to fetch.
     */
    where?: DogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Dogs to fetch.
     */
    orderBy?: DogOrderByWithRelationInput | DogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Dogs.
     */
    cursor?: DogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Dogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Dogs.
     */
    skip?: number
    distinct?: DogScalarFieldEnum | DogScalarFieldEnum[]
  }

  /**
   * Dog create
   */
  export type DogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dog
     */
    select?: DogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dog
     */
    omit?: DogOmit<ExtArgs> | null
    /**
     * The data needed to create a Dog.
     */
    data: XOR<DogCreateInput, DogUncheckedCreateInput>
  }

  /**
   * Dog createMany
   */
  export type DogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Dogs.
     */
    data: DogCreateManyInput | DogCreateManyInput[]
  }

  /**
   * Dog createManyAndReturn
   */
  export type DogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dog
     */
    select?: DogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Dog
     */
    omit?: DogOmit<ExtArgs> | null
    /**
     * The data used to create many Dogs.
     */
    data: DogCreateManyInput | DogCreateManyInput[]
  }

  /**
   * Dog update
   */
  export type DogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dog
     */
    select?: DogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dog
     */
    omit?: DogOmit<ExtArgs> | null
    /**
     * The data needed to update a Dog.
     */
    data: XOR<DogUpdateInput, DogUncheckedUpdateInput>
    /**
     * Choose, which Dog to update.
     */
    where: DogWhereUniqueInput
  }

  /**
   * Dog updateMany
   */
  export type DogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Dogs.
     */
    data: XOR<DogUpdateManyMutationInput, DogUncheckedUpdateManyInput>
    /**
     * Filter which Dogs to update
     */
    where?: DogWhereInput
    /**
     * Limit how many Dogs to update.
     */
    limit?: number
  }

  /**
   * Dog updateManyAndReturn
   */
  export type DogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dog
     */
    select?: DogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Dog
     */
    omit?: DogOmit<ExtArgs> | null
    /**
     * The data used to update Dogs.
     */
    data: XOR<DogUpdateManyMutationInput, DogUncheckedUpdateManyInput>
    /**
     * Filter which Dogs to update
     */
    where?: DogWhereInput
    /**
     * Limit how many Dogs to update.
     */
    limit?: number
  }

  /**
   * Dog upsert
   */
  export type DogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dog
     */
    select?: DogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dog
     */
    omit?: DogOmit<ExtArgs> | null
    /**
     * The filter to search for the Dog to update in case it exists.
     */
    where: DogWhereUniqueInput
    /**
     * In case the Dog found by the `where` argument doesn't exist, create a new Dog with this data.
     */
    create: XOR<DogCreateInput, DogUncheckedCreateInput>
    /**
     * In case the Dog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DogUpdateInput, DogUncheckedUpdateInput>
  }

  /**
   * Dog delete
   */
  export type DogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dog
     */
    select?: DogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dog
     */
    omit?: DogOmit<ExtArgs> | null
    /**
     * Filter which Dog to delete.
     */
    where: DogWhereUniqueInput
  }

  /**
   * Dog deleteMany
   */
  export type DogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Dogs to delete
     */
    where?: DogWhereInput
    /**
     * Limit how many Dogs to delete.
     */
    limit?: number
  }

  /**
   * Dog without action
   */
  export type DogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dog
     */
    select?: DogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Dog
     */
    omit?: DogOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const DogScalarFieldEnum: {
    id: 'id',
    externalId: 'externalId',
    name: 'name',
    imageUrl: 'imageUrl',
    link: 'link',
    age: 'age',
    sex: 'sex',
    breed: 'breed',
    location: 'location',
    county: 'county',
    region: 'region',
    charity: 'charity',
    description: 'description',
    ageCategory: 'ageCategory',
    seoSlug: 'seoSlug',
    seoTitle: 'seoTitle',
    seoDescription: 'seoDescription',
    scrapedDate: 'scrapedDate',
    lastSeen: 'lastSeen'
  };

  export type DogScalarFieldEnum = (typeof DogScalarFieldEnum)[keyof typeof DogScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type DogWhereInput = {
    AND?: DogWhereInput | DogWhereInput[]
    OR?: DogWhereInput[]
    NOT?: DogWhereInput | DogWhereInput[]
    id?: IntFilter<"Dog"> | number
    externalId?: StringFilter<"Dog"> | string
    name?: StringFilter<"Dog"> | string
    imageUrl?: StringNullableFilter<"Dog"> | string | null
    link?: StringNullableFilter<"Dog"> | string | null
    age?: StringNullableFilter<"Dog"> | string | null
    sex?: StringNullableFilter<"Dog"> | string | null
    breed?: StringNullableFilter<"Dog"> | string | null
    location?: StringNullableFilter<"Dog"> | string | null
    county?: StringNullableFilter<"Dog"> | string | null
    region?: StringNullableFilter<"Dog"> | string | null
    charity?: StringNullableFilter<"Dog"> | string | null
    description?: StringNullableFilter<"Dog"> | string | null
    ageCategory?: StringNullableFilter<"Dog"> | string | null
    seoSlug?: StringNullableFilter<"Dog"> | string | null
    seoTitle?: StringNullableFilter<"Dog"> | string | null
    seoDescription?: StringNullableFilter<"Dog"> | string | null
    scrapedDate?: DateTimeNullableFilter<"Dog"> | Date | string | null
    lastSeen?: DateTimeNullableFilter<"Dog"> | Date | string | null
  }

  export type DogOrderByWithRelationInput = {
    id?: SortOrder
    externalId?: SortOrder
    name?: SortOrder
    imageUrl?: SortOrderInput | SortOrder
    link?: SortOrderInput | SortOrder
    age?: SortOrderInput | SortOrder
    sex?: SortOrderInput | SortOrder
    breed?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    county?: SortOrderInput | SortOrder
    region?: SortOrderInput | SortOrder
    charity?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    ageCategory?: SortOrderInput | SortOrder
    seoSlug?: SortOrderInput | SortOrder
    seoTitle?: SortOrderInput | SortOrder
    seoDescription?: SortOrderInput | SortOrder
    scrapedDate?: SortOrderInput | SortOrder
    lastSeen?: SortOrderInput | SortOrder
  }

  export type DogWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    externalId?: string
    AND?: DogWhereInput | DogWhereInput[]
    OR?: DogWhereInput[]
    NOT?: DogWhereInput | DogWhereInput[]
    name?: StringFilter<"Dog"> | string
    imageUrl?: StringNullableFilter<"Dog"> | string | null
    link?: StringNullableFilter<"Dog"> | string | null
    age?: StringNullableFilter<"Dog"> | string | null
    sex?: StringNullableFilter<"Dog"> | string | null
    breed?: StringNullableFilter<"Dog"> | string | null
    location?: StringNullableFilter<"Dog"> | string | null
    county?: StringNullableFilter<"Dog"> | string | null
    region?: StringNullableFilter<"Dog"> | string | null
    charity?: StringNullableFilter<"Dog"> | string | null
    description?: StringNullableFilter<"Dog"> | string | null
    ageCategory?: StringNullableFilter<"Dog"> | string | null
    seoSlug?: StringNullableFilter<"Dog"> | string | null
    seoTitle?: StringNullableFilter<"Dog"> | string | null
    seoDescription?: StringNullableFilter<"Dog"> | string | null
    scrapedDate?: DateTimeNullableFilter<"Dog"> | Date | string | null
    lastSeen?: DateTimeNullableFilter<"Dog"> | Date | string | null
  }, "id" | "externalId">

  export type DogOrderByWithAggregationInput = {
    id?: SortOrder
    externalId?: SortOrder
    name?: SortOrder
    imageUrl?: SortOrderInput | SortOrder
    link?: SortOrderInput | SortOrder
    age?: SortOrderInput | SortOrder
    sex?: SortOrderInput | SortOrder
    breed?: SortOrderInput | SortOrder
    location?: SortOrderInput | SortOrder
    county?: SortOrderInput | SortOrder
    region?: SortOrderInput | SortOrder
    charity?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    ageCategory?: SortOrderInput | SortOrder
    seoSlug?: SortOrderInput | SortOrder
    seoTitle?: SortOrderInput | SortOrder
    seoDescription?: SortOrderInput | SortOrder
    scrapedDate?: SortOrderInput | SortOrder
    lastSeen?: SortOrderInput | SortOrder
    _count?: DogCountOrderByAggregateInput
    _avg?: DogAvgOrderByAggregateInput
    _max?: DogMaxOrderByAggregateInput
    _min?: DogMinOrderByAggregateInput
    _sum?: DogSumOrderByAggregateInput
  }

  export type DogScalarWhereWithAggregatesInput = {
    AND?: DogScalarWhereWithAggregatesInput | DogScalarWhereWithAggregatesInput[]
    OR?: DogScalarWhereWithAggregatesInput[]
    NOT?: DogScalarWhereWithAggregatesInput | DogScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Dog"> | number
    externalId?: StringWithAggregatesFilter<"Dog"> | string
    name?: StringWithAggregatesFilter<"Dog"> | string
    imageUrl?: StringNullableWithAggregatesFilter<"Dog"> | string | null
    link?: StringNullableWithAggregatesFilter<"Dog"> | string | null
    age?: StringNullableWithAggregatesFilter<"Dog"> | string | null
    sex?: StringNullableWithAggregatesFilter<"Dog"> | string | null
    breed?: StringNullableWithAggregatesFilter<"Dog"> | string | null
    location?: StringNullableWithAggregatesFilter<"Dog"> | string | null
    county?: StringNullableWithAggregatesFilter<"Dog"> | string | null
    region?: StringNullableWithAggregatesFilter<"Dog"> | string | null
    charity?: StringNullableWithAggregatesFilter<"Dog"> | string | null
    description?: StringNullableWithAggregatesFilter<"Dog"> | string | null
    ageCategory?: StringNullableWithAggregatesFilter<"Dog"> | string | null
    seoSlug?: StringNullableWithAggregatesFilter<"Dog"> | string | null
    seoTitle?: StringNullableWithAggregatesFilter<"Dog"> | string | null
    seoDescription?: StringNullableWithAggregatesFilter<"Dog"> | string | null
    scrapedDate?: DateTimeNullableWithAggregatesFilter<"Dog"> | Date | string | null
    lastSeen?: DateTimeNullableWithAggregatesFilter<"Dog"> | Date | string | null
  }

  export type DogCreateInput = {
    externalId: string
    name: string
    imageUrl?: string | null
    link?: string | null
    age?: string | null
    sex?: string | null
    breed?: string | null
    location?: string | null
    county?: string | null
    region?: string | null
    charity?: string | null
    description?: string | null
    ageCategory?: string | null
    seoSlug?: string | null
    seoTitle?: string | null
    seoDescription?: string | null
    scrapedDate?: Date | string | null
    lastSeen?: Date | string | null
  }

  export type DogUncheckedCreateInput = {
    id?: number
    externalId: string
    name: string
    imageUrl?: string | null
    link?: string | null
    age?: string | null
    sex?: string | null
    breed?: string | null
    location?: string | null
    county?: string | null
    region?: string | null
    charity?: string | null
    description?: string | null
    ageCategory?: string | null
    seoSlug?: string | null
    seoTitle?: string | null
    seoDescription?: string | null
    scrapedDate?: Date | string | null
    lastSeen?: Date | string | null
  }

  export type DogUpdateInput = {
    externalId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    link?: NullableStringFieldUpdateOperationsInput | string | null
    age?: NullableStringFieldUpdateOperationsInput | string | null
    sex?: NullableStringFieldUpdateOperationsInput | string | null
    breed?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    county?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    charity?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    ageCategory?: NullableStringFieldUpdateOperationsInput | string | null
    seoSlug?: NullableStringFieldUpdateOperationsInput | string | null
    seoTitle?: NullableStringFieldUpdateOperationsInput | string | null
    seoDescription?: NullableStringFieldUpdateOperationsInput | string | null
    scrapedDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSeen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DogUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    externalId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    link?: NullableStringFieldUpdateOperationsInput | string | null
    age?: NullableStringFieldUpdateOperationsInput | string | null
    sex?: NullableStringFieldUpdateOperationsInput | string | null
    breed?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    county?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    charity?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    ageCategory?: NullableStringFieldUpdateOperationsInput | string | null
    seoSlug?: NullableStringFieldUpdateOperationsInput | string | null
    seoTitle?: NullableStringFieldUpdateOperationsInput | string | null
    seoDescription?: NullableStringFieldUpdateOperationsInput | string | null
    scrapedDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSeen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DogCreateManyInput = {
    id?: number
    externalId: string
    name: string
    imageUrl?: string | null
    link?: string | null
    age?: string | null
    sex?: string | null
    breed?: string | null
    location?: string | null
    county?: string | null
    region?: string | null
    charity?: string | null
    description?: string | null
    ageCategory?: string | null
    seoSlug?: string | null
    seoTitle?: string | null
    seoDescription?: string | null
    scrapedDate?: Date | string | null
    lastSeen?: Date | string | null
  }

  export type DogUpdateManyMutationInput = {
    externalId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    link?: NullableStringFieldUpdateOperationsInput | string | null
    age?: NullableStringFieldUpdateOperationsInput | string | null
    sex?: NullableStringFieldUpdateOperationsInput | string | null
    breed?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    county?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    charity?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    ageCategory?: NullableStringFieldUpdateOperationsInput | string | null
    seoSlug?: NullableStringFieldUpdateOperationsInput | string | null
    seoTitle?: NullableStringFieldUpdateOperationsInput | string | null
    seoDescription?: NullableStringFieldUpdateOperationsInput | string | null
    scrapedDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSeen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DogUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    externalId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    imageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    link?: NullableStringFieldUpdateOperationsInput | string | null
    age?: NullableStringFieldUpdateOperationsInput | string | null
    sex?: NullableStringFieldUpdateOperationsInput | string | null
    breed?: NullableStringFieldUpdateOperationsInput | string | null
    location?: NullableStringFieldUpdateOperationsInput | string | null
    county?: NullableStringFieldUpdateOperationsInput | string | null
    region?: NullableStringFieldUpdateOperationsInput | string | null
    charity?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    ageCategory?: NullableStringFieldUpdateOperationsInput | string | null
    seoSlug?: NullableStringFieldUpdateOperationsInput | string | null
    seoTitle?: NullableStringFieldUpdateOperationsInput | string | null
    seoDescription?: NullableStringFieldUpdateOperationsInput | string | null
    scrapedDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastSeen?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type DogCountOrderByAggregateInput = {
    id?: SortOrder
    externalId?: SortOrder
    name?: SortOrder
    imageUrl?: SortOrder
    link?: SortOrder
    age?: SortOrder
    sex?: SortOrder
    breed?: SortOrder
    location?: SortOrder
    county?: SortOrder
    region?: SortOrder
    charity?: SortOrder
    description?: SortOrder
    ageCategory?: SortOrder
    seoSlug?: SortOrder
    seoTitle?: SortOrder
    seoDescription?: SortOrder
    scrapedDate?: SortOrder
    lastSeen?: SortOrder
  }

  export type DogAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type DogMaxOrderByAggregateInput = {
    id?: SortOrder
    externalId?: SortOrder
    name?: SortOrder
    imageUrl?: SortOrder
    link?: SortOrder
    age?: SortOrder
    sex?: SortOrder
    breed?: SortOrder
    location?: SortOrder
    county?: SortOrder
    region?: SortOrder
    charity?: SortOrder
    description?: SortOrder
    ageCategory?: SortOrder
    seoSlug?: SortOrder
    seoTitle?: SortOrder
    seoDescription?: SortOrder
    scrapedDate?: SortOrder
    lastSeen?: SortOrder
  }

  export type DogMinOrderByAggregateInput = {
    id?: SortOrder
    externalId?: SortOrder
    name?: SortOrder
    imageUrl?: SortOrder
    link?: SortOrder
    age?: SortOrder
    sex?: SortOrder
    breed?: SortOrder
    location?: SortOrder
    county?: SortOrder
    region?: SortOrder
    charity?: SortOrder
    description?: SortOrder
    ageCategory?: SortOrder
    seoSlug?: SortOrder
    seoTitle?: SortOrder
    seoDescription?: SortOrder
    scrapedDate?: SortOrder
    lastSeen?: SortOrder
  }

  export type DogSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}