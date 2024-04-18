
using CipherDrop.Data;
using CipherDrop.Models; 

namespace CipherDrop.Utils.ActivityUtils
{
    public static class ActivityUtils
    {
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
