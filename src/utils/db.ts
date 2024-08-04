import { config } from "dotenv";
import sql, {
  ConnectionPool,
  Request as IRequest,
  IResult,
  ISqlType,
  ISqlTypeFactoryWithLength,
  config as SqlConfig,
  Transaction,
} from "mssql";
config();

interface QueryParam {
  type: ISqlTypeFactoryWithLength | ISqlType;
  value: string | number | boolean | Date | Buffer | null;
}

interface QueryResult {
  rowCount: number;
  rows: Record<string, string | number | boolean | Date | Buffer | null>[];
}

class Database {
  private pool: ConnectionPool;
  private config: SqlConfig;

  constructor() {
    this.config = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      server: process.env.DB_HOST!,
      database: process.env.DB_NAME,
      port: +process.env.DB_PORT!,
      options: {
        encrypt: false,
      },
    };
    this.pool = new sql.ConnectionPool(this.config);
    this.connect();
  }

  private async connect(): Promise<void> {
    try {
      await this.pool.connect();
      console.log("Connected");
    } catch (err) {
      console.error("Connection failed: ", err);
    }
  }

  public async query(
    queryString: string,
    params?: QueryParam[]
  ): Promise<QueryResult> {
    const transaction: Transaction = new sql.Transaction(this.pool);
    try {
      await transaction.begin();
      const request: IRequest = transaction.request();

      if (params) {
        params.forEach((param, index) => {
          request.input(`param${index + 1}`, param.type, param.value);
        });
      }

      const result: IResult<any> = await request.query(queryString);
      await transaction.commit();
      return { rowCount: result.rowsAffected[0], rows: result.recordset };
    } catch (err) {
      await transaction.rollback();
      console.error("Query failed: ", err);
      throw err;
    }
  }
}

const dbInstance = new Database();
export const query = dbInstance.query.bind(dbInstance);
