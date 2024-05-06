
using CipherDrop.Data;
using CipherDrop.Models; 

namespace CipherDrop.Services
{
    public static class ActivityService
    {
    public static List<UserActivityViewModel> GetPaginatedUserActivity(CipherDropContext context, int lastId, int pageSize = 30)
    {
        return [.. context.UserActivity
                        .Join(context.User, a => a.UserId, u => u.Id, (a, u) => new { a, u })
                        .Where(au => au.a.Id > lastId)
                        .OrderByDescending(au => au.a.CreatedAt)
                        .Take(pageSize)
                        .Select(au => new UserActivityViewModel
                        {
                            Area = au.a.Area,
                            Action = au.a.Action,
                            Type = au.a.Type,
                            CreatedAt = au.a.CreatedAt,
                            UserId = au.a.UserId,
                            UserName = au.u.Name,
                        })];
    }
    
        public static async Task<UserActivity?> AddActivityAsync(string area, object areaId, string action, string type, Session? session, CipherDropContext context) 
        {
            if (session == null)
            {
                return null;
            }
            var activity = new UserActivity
            {
                Area = area,
                UserId = session.UserId,
                Action = action,
                Type = type
            };

            if (areaId is string stringAreaId)
            {
                activity.StringAreaId = stringAreaId;
            }
            else if (areaId is int intAreaId)
            {
                activity.AreaId = intAreaId;
            }
            else
            {
                throw new ArgumentException("Invalid areaId type. It must be either string or int.");
            }

            context.UserActivity.Add(activity);
            await context.SaveChangesAsync();
            
            return activity;
        }
    }
}
