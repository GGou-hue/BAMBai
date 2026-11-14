# Process generated skyline sources -> 2048x504 RGBA PNGs with alpha
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;

public static class SkyProc {
    public static Bitmap Key(Bitmap src) {
        Bitmap outB = new Bitmap(src.Width, src.Height, PixelFormat.Format32bppArgb);
        BitmapData sd = src.LockBits(new Rectangle(0,0,src.Width,src.Height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
        BitmapData dd = outB.LockBits(new Rectangle(0,0,outB.Width,outB.Height), ImageLockMode.WriteOnly, PixelFormat.Format32bppArgb);
        int stride = sd.Stride; int h = src.Height; int w = src.Width;
        byte[] buf = new byte[stride*h];
        System.Runtime.InteropServices.Marshal.Copy(sd.Scan0, buf, 0, buf.Length);
        src.UnlockBits(sd);
        byte[] ob = new byte[stride*h];
        for (int y=0; y<h; y++) {
            for (int x=0; x<w; x++) {
                int o = y*stride + x*4;
                int b = buf[o], g = buf[o+1], r = buf[o+2];
                byte a = 255;
                if (r>140 && (r-g)>60 && (b-g)>15) a = 0;   // pink/magenta sky: R high, G much lower than R and B
                else if (r>170 && b>170 && g<110) a = 0;    // pure magenta fallback
                ob[o]=(byte)b; ob[o+1]=(byte)g; ob[o+2]=(byte)r; ob[o+3]=a;
            }
        }
        System.Runtime.InteropServices.Marshal.Copy(ob, 0, dd.Scan0, ob.Length);
        outB.UnlockBits(dd);
        return outB;
    }

    public static Bitmap Compose(Bitmap keyed, int targetW, int targetH, int fade, double sat) {
        int W = keyed.Width, H = keyed.Height;
        int top = -1;
        for (int y=0; y<H && top<0; y++)
            for (int x=0; x<W; x++)
                if (keyed.GetPixel(x,y).A > 8) { top = y; break; }
        if (top < 0) top = H-1;
        int skyH = H - top;
        double scale = Math.Min((double)targetW / W, 300.0 / skyH);
        int sw = (int)Math.Round(W*scale), sh = (int)Math.Round(H*scale);
        Bitmap scaled = new Bitmap(sw, sh, PixelFormat.Format32bppArgb);
        using (Graphics gr = Graphics.FromImage(scaled)) {
            gr.InterpolationMode = InterpolationMode.HighQualityBicubic;
            gr.DrawImage(keyed, new Rectangle(0,0,sw,sh));
        }
        Bitmap canvas = new Bitmap(targetW, targetH, PixelFormat.Format32bppArgb);
        using (Graphics gr = Graphics.FromImage(canvas)) {
            gr.InterpolationMode = InterpolationMode.HighQualityBicubic;
            gr.CompositingMode = CompositingMode.SourceCopy;
            int x0 = 0;
            while (x0 < targetW) {
                gr.DrawImage(scaled, x0, targetH-sh, sw, sh);
                x0 += sw;
            }
        }
        BitmapData dd = canvas.LockBits(new Rectangle(0,0,targetW,targetH), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
        int stride = dd.Stride; byte[] buf = new byte[stride*targetH];
        System.Runtime.InteropServices.Marshal.Copy(dd.Scan0, buf, 0, buf.Length);
        for (int y=0; y<targetH; y++) {
            for (int x=0; x<fade; x++) {
                double k = (double)x/fade;
                buf[y*stride + x*4+3] = (byte)(buf[y*stride + x*4+3]*k);
                int x2 = targetW-1-x;
                buf[y*stride + x2*4+3] = (byte)(buf[y*stride + x2*4+3]*k);
            }
        }
        System.Runtime.InteropServices.Marshal.Copy(buf, 0, dd.Scan0, buf.Length);
        canvas.UnlockBits(dd);
        if (sat <= 1.0) return canvas;
        // saturation boost so the skyline survives the distance fog
        Bitmap outB = new Bitmap(targetW, targetH, PixelFormat.Format32bppArgb);
        using (Graphics gr = Graphics.FromImage(outB)) {
            gr.CompositingMode = CompositingMode.SourceCopy;
            double lw = 0.3086, lg = 0.6094, lb = 0.0820;
            var cm = new ColorMatrix(new float[][]{
                new float[]{(float)(lw*(1-sat)+sat), (float)(lw*(1-sat)), (float)(lw*(1-sat)), 0, 0},
                new float[]{(float)(lg*(1-sat)), (float)(lg*(1-sat)+sat), (float)(lg*(1-sat)), 0, 0},
                new float[]{(float)(lb*(1-sat)), (float)(lb*(1-sat)), (float)(lb*(1-sat)+sat), 0, 0},
                new float[]{0,0,0,1,0},
                new float[]{0,0,0,0,1}});
            var ia = new ImageAttributes();
            ia.SetColorMatrix(cm);
            gr.DrawImage(canvas, new Rectangle(0,0,targetW,targetH), 0,0,targetW,targetH, GraphicsUnit.Pixel, ia);
        }
        canvas.Dispose();
        return outB;
    }
}
"@

function Convert-Sky($srcPath, $outPath, $sat = 1.0) {
  $src = [System.Drawing.Image]::FromFile($srcPath)
  $keyed = [SkyProc]::Key([System.Drawing.Bitmap]$src)
  $src.Dispose()
  $canvas = [SkyProc]::Compose($keyed, 2048, 504, 48, $sat)
  $keyed.Dispose()
  $canvas.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Dispose()
  Write-Host "saved $outPath"
}
Convert-Sky (Resolve-Path "images/sky-day-src-e7e422.jpg") "C:\Users\User4\Downloads\BAMBai\art\sky\SKY-DAY-01.png" 1.45
Convert-Sky (Resolve-Path "images/sky-dusk-src-b1dd42.jpg") "C:\Users\User4\Downloads\BAMBai\art\sky\SKY-DUSK-01.png"
Convert-Sky (Resolve-Path "images/sky-night-src-6ca8b5.jpg") "C:\Users\User4\Downloads\BAMBai\art\sky\SKY-NIGHT-01.png"
