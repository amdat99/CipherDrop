
using System.Security.Cryptography;

namespace CipherDrop.Utils
{
    public class EncryptionUtils()
    {
        public static string? EncryptionKey { get; set; }
        public static string Encrypt(string plainText, string? key = null)
        {
            using var aes = Aes.Create();
            aes.KeySize = 256;
            aes.Key = System.Text.Encoding.UTF8.GetBytes(GetKey(key) );
            aes.IV = new byte[16];
            using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
            using var ms = new MemoryStream();
            using var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write);
            using var sw = new StreamWriter(cs);
            sw.Write(plainText);
            sw.Flush();
            cs.FlushFinalBlock();
            return Convert.ToBase64String(ms.ToArray());
        }

        public static string Decrypt(string cipherText, string? key = null)
        {
            using var aes = Aes.Create();
            aes.KeySize = 256;
            aes.Key = System.Text.Encoding.UTF8.GetBytes(GetKey(key) );
            aes.IV = new byte[16];
            using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
            using var ms = new MemoryStream(Convert.FromBase64String(cipherText));
            using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
            using var sr = new StreamReader(cs);
            return sr.ReadToEnd();
        }

        private static string GetKey( string? key )
        {
            if( key != null )
            {
                return key;
            }
            else if( EncryptionKey != null )
            {
                return EncryptionKey;
            }
            return Environment.GetEnvironmentVariable("ENCRYPTION_KEY") ?? throw new Exception("ENCRYPTION_KEY not set");
        }
    }
}
