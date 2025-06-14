package com.augmentos.augmentos_core.smarterglassesmanager.supportedglasses;

public class JanYunGS380 extends SmartGlassesDevice {
    public JanYunGS380() {
        deviceModelName = "GS380";
        deviceIconName = "tcl_rayneo_x_two";
        anySupport = true;
        fullSupport = false;
        glassesOs = SmartGlassesOperatingSystem.ANDROID_OS_GLASSES;
        hasDisplay = true;
        hasSpeakers = true;
        hasCamera = true;
        hasInMic = true;
        hasOutMic = false; //unknown
        weight = 120; //unknown
    }
}
