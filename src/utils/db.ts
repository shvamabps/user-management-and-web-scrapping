import { config } from "dotenv";
import sql, {
  ConnectionPool,
  Request as IRequest,
  IResult,
  config as SqlConfig,
} from "mssql";
config();

interface QueryParam {
  type: any; // You can replace 'any' with specific types from 'mssql' if known
  value: any;
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
  ): Promise<{
    rowCount: number;
    rows: Record<string, string | number | boolean>[];
  }> {
    try {
      const request: IRequest = this.pool.request();

      if (params) {
        params.forEach((param, index) => {
          return request.input(`param${index + 1}`, param.type, param.value);
        });
      }

      const result: IResult<any> = await request.query(queryString);
      return { rowCount: result.rowsAffected[0], rows: result.recordset };
    } catch (err) {
      console.error("Query failed: ", err);
      throw err;
    }
  }
}

const dbInstance = new Database();
export const query = dbInstance.query.bind(dbInstance);
