using System;
using System.IO;
using System.Text;
using System.Drawing;
using System.Windows.Forms;
using System.Web.Script.Serialization;
using System.Collections.Generic;
using System.Threading;
using System.Runtime.InteropServices;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
[assembly: System.Runtime.Versioning.TargetFramework(".NETFramework,Version=v4.8")]

// C# 只负责窗口和本地文件。界面与业务逻辑在 ui 文件夹中。
class DiaryWindow : Form {
    [DllImport("dwmapi.dll")] static extern int DwmSetWindowAttribute(IntPtr hwnd,int attr,ref int value,int size);
    readonly WebView2 view = new WebView2();
    readonly JavaScriptSerializer json = new JavaScriptSerializer { MaxJsonLength = 16000000 };
    readonly string dataRoot;
    readonly bool testing;
    bool allowClose = false;
    public DiaryWindow(string root, bool test) {
        dataRoot=root; testing=test; Text="日和 · 每日计划与日记";
        AutoScaleDimensions=new SizeF(96,96); AutoScaleMode=AutoScaleMode.Dpi;
        Width=1060; Height=920; MinimumSize=new Size(620,560);
        StartPosition=FormStartPosition.CenterScreen; BackColor=Color.FromArgb(245,243,237);
        string iconPath=Path.Combine(AppDomain.CurrentDomain.BaseDirectory,"日和.ico");
        if(File.Exists(iconPath))Icon=new Icon(iconPath);
        view.Dock=DockStyle.Fill; view.DefaultBackgroundColor=BackColor; Controls.Add(view);
        FormClosing+=(s,e)=>{
            if(allowClose||view.CoreWebView2==null)return;
            e.Cancel=true;
            // 等待前端把最后一次修改写完后，才真正关闭窗口。
            view.CoreWebView2.PostWebMessageAsJson("{\"event\":\"closing\"}");
        };
        Shown+=async delegate {
            try {
                var screen=Screen.FromControl(this).WorkingArea;float scale=DeviceDpi/96F;
                Size=new Size(Math.Min((int)(1060*scale),screen.Width-60),Math.Min((int)(950*scale),screen.Height-70));
                Location=new Point(screen.Left+(screen.Width-Width)/2,screen.Top+(screen.Height-Height)/2);
                Directory.CreateDirectory(dataRoot);
                // 测试实例使用单独数据目录；普通启动不开放调试端口。
                var options=new CoreWebView2EnvironmentOptions(testing?"--remote-debugging-port=9337":null);
                var env=await CoreWebView2Environment.CreateAsync(null,Path.Combine(dataRoot,"WebView"),options);
                await view.EnsureCoreWebView2Async(env);
                view.CoreWebView2.Settings.AreDevToolsEnabled=testing;
                view.CoreWebView2.Settings.AreDefaultContextMenusEnabled=false;
                view.CoreWebView2.Settings.IsStatusBarEnabled=false;
                view.CoreWebView2.Settings.IsZoomControlEnabled=false;
                view.CoreWebView2.Settings.AreBrowserAcceleratorKeysEnabled=testing;
                view.CoreWebView2.SetVirtualHostNameToFolderMapping("hiyori.local",Path.Combine(AppDomain.CurrentDomain.BaseDirectory,"ui"),CoreWebView2HostResourceAccessKind.DenyCors);
                view.CoreWebView2.NavigationStarting+=(s,e)=>{if(!e.Uri.StartsWith("https://hiyori.local/",StringComparison.Ordinal))e.Cancel=true;};
                view.CoreWebView2.NewWindowRequested+=(s,e)=>e.Handled=true;
                view.CoreWebView2.WebMessageReceived+=Message;
                view.Source=new Uri("https://hiyori.local/index.html");
            } catch(Exception ex){MessageBox.Show("日和暂时无法启动："+ex.Message,"日和");allowClose=true;Close();}
        };
    }
    void AtomicSave(string value) {
        var data=json.Deserialize<Dictionary<string,object>>(value);
        if(!data.ContainsKey("version")||Convert.ToInt32(data["version"])!=1||!data.ContainsKey("days"))throw new Exception("记录格式不正确");
        string file=Path.Combine(dataRoot,"data.json"),temp=Path.Combine(dataRoot,"data.tmp");
        // 临时文件写完并刷入磁盘后再替换，旧文件保留为 previous.json。
        byte[] bytes=new UTF8Encoding(false).GetBytes(value);
        using(var stream=new FileStream(temp,FileMode.Create,FileAccess.Write,FileShare.None)){stream.Write(bytes,0,bytes.Length);stream.Flush(true);}
        if(File.Exists(file))File.Replace(temp,file,Path.Combine(dataRoot,"previous.json"));else File.Move(temp,file);
    }
    void Message(object sender,CoreWebView2WebMessageReceivedEventArgs e) {
        string id="";
        try {
            if(!e.Source.StartsWith("https://hiyori.local/",StringComparison.Ordinal))return;
            var m=json.Deserialize<Dictionary<string,object>>(e.WebMessageAsJson);id=(string)m["id"];string op=(string)m["op"];object result=null;
            string file=Path.Combine(dataRoot,"data.json"),backup=Path.Combine(dataRoot,"previous.json");
            if(op=="load")result=new {current=File.Exists(file)?File.ReadAllText(file):null,backup=File.Exists(backup)?File.ReadAllText(backup):null};
            else if(op=="save"){AtomicSave((string)m["data"]);result=true;}
            else if(op=="export"){
                using(var dialog=new SaveFileDialog{Filter="日和备份 (*.json)|*.json",FileName="日和备份-"+DateTime.Now.ToString("yyyy-MM-dd")+".json",DefaultExt="json",AddExtension=true}){
                    result=false;if(dialog.ShowDialog(this)==DialogResult.OK){File.WriteAllText(dialog.FileName,(string)m["data"],new UTF8Encoding(false));result=true;}
                }
            } else if(op=="import"){
                using(var dialog=new OpenFileDialog{Filter="日和备份 (*.json)|*.json"}){
                    if(dialog.ShowDialog(this)==DialogResult.OK){if(new FileInfo(dialog.FileName).Length>16000000)throw new Exception("文件不能超过 16 MB");result=File.ReadAllText(dialog.FileName);}
                }
            } else if(op=="archive"){
                if(File.Exists(file))File.Copy(file,Path.Combine(dataRoot,"before-import-"+DateTime.Now.ToString("yyyyMMdd-HHmmss-fff")+".json"));result=true;
            } else if(op=="theme"){
                int dark=Convert.ToBoolean(m["data"])?1:0;DwmSetWindowAttribute(Handle,20,ref dark,4);
                view.DefaultBackgroundColor=dark==1?Color.FromArgb(30,35,31):Color.FromArgb(245,243,237);result=true;
            } else if(op=="close"){allowClose=true;BeginInvoke(new Action(Close));result=true;}
            else if(op=="info")result=new {dataRoot=dataRoot,dpi=DeviceDpi,testing=testing};
            else throw new Exception("不支持的操作");
            view.CoreWebView2.PostWebMessageAsJson(json.Serialize(new {id=id,data=result}));
        }catch(Exception ex){view.CoreWebView2.PostWebMessageAsJson(json.Serialize(new {id=id,error=ex.Message}));}
    }
    [STAThread] static void Main(string[] args) {
        Application.EnableVisualStyles();Application.SetCompatibleTextRenderingDefault(false);
        bool testing=args.Length==2&&args[0]=="--test-data";
        string root=testing?Path.GetFullPath(args[1]):Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"HiyoriDiary");
        bool created;
        using(var mutex=new Mutex(true,testing?"HiyoriDiary.Test":"HiyoriDiary.Main",out created)){
            if(!created){MessageBox.Show("日和已经打开了，可以从任务栏回到它。","日和");return;}
            Application.Run(new DiaryWindow(root,testing));
        }
    }
}
