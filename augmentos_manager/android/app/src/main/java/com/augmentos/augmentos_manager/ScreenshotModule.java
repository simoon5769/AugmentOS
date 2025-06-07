package com.augmentos.augmentos_manager; // 替换为你的包名

import android.graphics.Bitmap;
import android.view.View;
import android.os.Environment;
import java.io.File;
import java.io.FileOutputStream;
import java.util.UUID;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class ScreenshotModule extends ReactContextBaseJavaModule {

    public ScreenshotModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "ScreenshotModule"; // 模块名称必须匹配
    }

    @ReactMethod
    public void takeScreenshot(Promise promise) {
        try {
            // 1. 获取根视图
            View rootView = getCurrentActivity().getWindow().getDecorView().getRootView();
            rootView.setDrawingCacheEnabled(true);
            Bitmap bitmap = Bitmap.createBitmap(rootView.getDrawingCache());
            rootView.setDrawingCacheEnabled(false);

            // 2. 创建截图文件
            File picturesDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES);
            String fileName = "screenshot_" + UUID.randomUUID().toString() + ".jpg";
            File screenshotFile = new File(picturesDir, fileName);

            // 3. 保存截图
            FileOutputStream fos = new FileOutputStream(screenshotFile);
            bitmap.compress(Bitmap.CompressFormat.JPEG, 90, fos);
            fos.flush();
            fos.close();

            // 4. 返回文件路径
            promise.resolve(screenshotFile.getAbsolutePath());
        } catch (Exception e) {
            promise.reject("SCREENSHOT_ERROR", "Failed to take screenshot", e);
        }
    }
}