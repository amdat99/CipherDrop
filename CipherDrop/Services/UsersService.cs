using CipherDrop.Data;
using CipherDrop.Models;

namespace CipherDrop.Services;
    public class UsersService
    {  
        public static List<User?> GetQueriedUsers(CipherDropContext context, string query, int limit = 20)
        {
          return [.. context.User
                        .Select(u => new User
                        {
                            Id = u.Id,
                            Name = u.Name,
                            Email = u.Email
                        })
                      .Where(u => u.Name.Contains(query) || u.Email.Contains(query))
                      .OrderBy(u => u.Id)
                      .Take(limit)];
        }
    }

     
