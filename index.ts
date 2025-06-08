import { TpaServer, TpaSession, AuthenticatedRequest } from '@augmentos/sdk';

// 从环境变量加载配置
const PACKAGE_NAME = process.env.PACKAGE_NAME || "com.example.myfirstaugmentosapp";
const PORT = parseInt(process.env.PORT || "3000");
const AUGMENTOS_API_KEY = process.env.AUGMENTOS_API_KEY;

console.log(process.env.PACKAGE_NAME)
console.log(process.env.PORT)
console.log(process.env.AUGMENTOS_API_KEY)

if (!AUGMENTOS_API_KEY) {
    console.error("必须设置 AUGMENTOS_API_KEY 环境变量");
    process.exit(1);
}

/**
 * MyAugmentOSApp - 在智能眼镜显示"Hello, World!"的基础应用
 */
class MyAugmentOSApp extends TpaServer {
    /**
     * 处理新会话连接
     * @param session - TPA会话实例
     * @param sessionId - 会话唯一标识
     * @param userId - 用户ID
     */
    protected async onSession(session: TpaSession, sessionId: string, userId: string): Promise<void> {
        console.log(`新会话: ${sessionId} | 用户: ${userId}`);

        // 在眼镜显示文本
        session.layouts.showTextWall("Hello, World! 1");
        // 在眼镜显示文本
        session.layouts.showTextWall("Hello, World! 2");
        // 在眼镜显示文本
        session.layouts.showTextWall("Hello, World! 3");

        // 监听断开连接事件
        session.events.onDisconnected(() => {
            console.log(`会话 ${sessionId} 已断开`);
        });
    }
}

// 创建并启动应用服务器
const server = new MyAugmentOSApp({
    packageName: PACKAGE_NAME,
    apiKey: AUGMENTOS_API_KEY,
    port: PORT,
    // augmentOSWebsocketUrl: `ws://localhost:${CLOUD_PORT}/tpa-ws`,
    "augmentOSWebsocketUrl": "wss://france.augmentos.cloud/tpa-ws",
    webhookPath: '/webhook',
});

const app = server.getExpressApp();

app.get('/webview', (req: AuthenticatedRequest, res) => {
  const userId = req.authUserId;
  console.log("request webview, userId:", userId)

  if (userId) {
    // User is authenticated, show personalized content
    res.send(`Welcome user ${userId}!`);
    // res.render('dashboard', { userId });
  } else {
    // User is not authenticated
    res.send('Please open this page from the AugmentOS app');
  }
});

app.get('/tpa_config.json', (req: AuthenticatedRequest, res) => {
  const userId = req.authUserId;
  console.log("request tpa_config.json, userId:", userId)

  if (userId) {
    // User is authenticated, show personalized content
    res.send(`{"userId:" ${userId}}`);
  } else {
    // User is not authenticated
    res.send('Please get tpa_config.json from the AugmentOS app'    );
  }
});

server.start().catch(err => {
    console.error("服务器启动失败:", err);
});
