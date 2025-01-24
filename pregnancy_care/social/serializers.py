from rest_framework import serializers
from .models import Post, Comment, Like, Follow, SavedPost
from account.serializers import UserSerializer

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ('id', 'post', 'author', 'content', 'parent_comment',
                 'likes_count', 'replies', 'created_at', 'updated_at')
        read_only_fields = ('likes_count', 'replies')
    
    def get_replies(self, obj):
        if obj.parent_comment is None:  # Only get replies for parent comments
            replies = Comment.objects.filter(parent_comment=obj)
            return CommentSerializer(replies, many=True).data
        return []

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = ('id', 'author', 'content', 'post_type', 'media_url',
                 'media_file', 'likes_count', 'comments_count', 'is_expert_verified',
                 'tags', 'comments', 'is_liked', 'is_saved', 'created_at', 'updated_at')
        read_only_fields = ('likes_count', 'comments_count', 'is_expert_verified')
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, post=obj).exists()
        return False
    
    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedPost.objects.filter(user=request.user, post=obj).exists()
        return False

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ('id', 'user', 'post', 'comment', 'created_at')
        read_only_fields = ('user',)

class FollowSerializer(serializers.ModelSerializer):
    follower = UserSerializer(read_only=True)
    following = UserSerializer(read_only=True)
    
    class Meta:
        model = Follow
        fields = ('id', 'follower', 'following', 'created_at')

class SavedPostSerializer(serializers.ModelSerializer):
    post = PostSerializer(read_only=True)
    
    class Meta:
        model = SavedPost
        fields = ('id', 'user', 'post', 'saved_at')
        read_only_fields = ('user',)
