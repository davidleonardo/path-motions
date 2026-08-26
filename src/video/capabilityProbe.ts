export interface CodecCapability {
  codec: string;
  label: string;
  supported: boolean;
  isHardwareAccelerated?: boolean;
}

export interface BrowserVideoCapabilities {
  webCodecsSupported: boolean;
  h264Supported: boolean;
  vp9Supported: boolean;
  vp8Supported: boolean;
  av1Supported: boolean;
  directDiskSaveSupported: boolean;
  codecs: CodecCapability[];
  preferredCodec: string;
}

export async function probeVideoCapabilities(
  width: number = 1920,
  height: number = 1080,
  fps: number = 30
): Promise<BrowserVideoCapabilities> {
  const hasWebCodecs = typeof window !== 'undefined' && 'VideoEncoder' in window;
  const directDiskSaveSupported = typeof window !== 'undefined' && 'showSaveFilePicker' in window;

  if (!hasWebCodecs) {
    return {
      webCodecsSupported: false,
      h264Supported: false,
      vp9Supported: false,
      vp8Supported: false,
      av1Supported: false,
      directDiskSaveSupported,
      codecs: [],
      preferredCodec: 'webm-fallback',
    };
  }

  const candidateCodecs = [
    { codec: 'avc1.640028', label: 'H.264 High Profile (MP4)' },
    { codec: 'avc1.4d002a', label: 'H.264 Main Profile (MP4)' },
    { codec: 'avc1.42001f', label: 'H.264 Baseline Profile (MP4)' },
    { codec: 'vp09.00.10.08', label: 'VP9 Profile 0 (WebM/MP4)' },
    { codec: 'vp8', label: 'VP8 (WebM)' },
    { codec: 'av01.0.08M.10', label: 'AV1 Main Profile' },
  ];

  const results: CodecCapability[] = [];

  for (const item of candidateCodecs) {
    try {
      const config = {
        codec: item.codec,
        width,
        height,
        bitrate: 12_000_000,
        framerate: fps,
      };
      const support = await (window as any).VideoEncoder.isConfigSupported(config);
      results.push({
        codec: item.codec,
        label: item.label,
        supported: !!support?.supported,
        isHardwareAccelerated: support?.config?.hardwareAcceleration === 'prefer-hardware',
      });
    } catch {
      results.push({
        codec: item.codec,
        label: item.label,
        supported: false,
      });
    }
  }

  const h264Supported = results.some((r) => r.codec.startsWith('avc1') && r.supported);
  const vp9Supported = results.some((r) => r.codec.startsWith('vp09') && r.supported);
  const vp8Supported = results.some((r) => r.codec === 'vp8' && r.supported);
  const av1Supported = results.some((r) => r.codec.startsWith('av01') && r.supported);

  let preferredCodec = 'avc1.640028';
  if (!h264Supported) {
    preferredCodec = vp9Supported ? 'vp09.00.10.08' : vp8Supported ? 'vp8' : 'webm-fallback';
  }

  return {
    webCodecsSupported: true,
    h264Supported,
    vp9Supported,
    vp8Supported,
    av1Supported,
    directDiskSaveSupported,
    codecs: results,
    preferredCodec,
  };
}
