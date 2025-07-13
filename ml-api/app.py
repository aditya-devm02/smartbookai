from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import Counter
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'recommendation-api'})

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        booked_ids = set(str(bid) for bid in data.get('booked_ids', []))
        all_activities = data.get('all_activities', [])
        activity_history = data.get('activity_history', [])

        logger.info(f"Received recommendation request: {len(all_activities)} activities, {len(booked_ids)} booked, {len(activity_history)} history")

        if not all_activities:
            return jsonify({'recommendations': []})

        # Find user's favorite category
        favorite_category = None
        if activity_history:
            category_counts = Counter(activity_history)
            favorite_category = category_counts.most_common(1)[0][0]
            logger.info(f"Favorite category: {favorite_category}")

        # Robustly extract activity _id as string for comparison
        def get_id(a):
            _id = a.get('_id')
            if isinstance(_id, dict) and '$oid' in _id:
                return _id['$oid']
            return str(_id)

        # Filter out already booked activities
        unbooked_activities = [
            a for a in all_activities 
            if get_id(a) not in booked_ids
        ]
        
        logger.info(f"Unbooked activities: {len(unbooked_activities)}")

        if not unbooked_activities:
            # If all activities are booked, return top popular activities anyway
            candidates = all_activities
        else:
            candidates = unbooked_activities

        # Enhanced recommendation logic
        scored_activities = []
        
        for activity in candidates:
            score = 0
            
            # Base popularity score (0-50 points)
            popularity = activity.get('popularity', 0)
            score += min(popularity * 5, 50)  # Cap at 50 points
            
            # Category preference score (0-30 points)
            if favorite_category and activity.get('category') == favorite_category:
                score += 30
            
            # Duration preference (0-10 points) - prefer medium duration activities
            duration = activity.get('duration', 60)
            if 30 <= duration <= 120:  # 30 min to 2 hours
                score += 10
            elif 15 <= duration <= 180:  # 15 min to 3 hours
                score += 5
            
            # Availability score (0-10 points) - prefer activities with more slots
            slots = activity.get('slots', 10)
            if slots > 5:
                score += 10
            elif slots > 2:
                score += 5
            
            scored_activities.append((activity, score))

        # Sort by score descending
        scored_activities.sort(key=lambda x: x[1], reverse=True)
        
        # Return top 3 recommendations (titles)
        recommendations = [activity['title'] for activity, score in scored_activities[:3]]
        
        logger.info(f"Generated recommendations: {recommendations}")
        
        return jsonify({
            'recommendations': recommendations,
            'debug_info': {
                'total_activities': len(all_activities),
                'unbooked_activities': len(unbooked_activities),
                'favorite_category': favorite_category,
                'top_scores': [score for _, score in scored_activities[:3]]
            }
        })
        
    except Exception as e:
        logger.error(f"Error in recommendation endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting recommendation API on port 5001")
    app.run(port=5001, debug=True, host='0.0.0.0') 