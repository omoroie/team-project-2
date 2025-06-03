import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApp } from '@/contexts/AppContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { BoardPost } from '@shared/schema';
import { Plus, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function Board() {
  const { t } = useLanguage();
  const { state } = useApp();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });

  const { data: posts = [], isLoading } = useQuery<BoardPost[]>({
    queryKey: ['/api/board'],
  });

  const createPostMutation = useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      apiRequest('POST', '/api/board', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/board'] });
      setNewPost({ title: '', content: '' });
      setShowCreateForm(false);
      toast({
        title: 'Success',
        description: 'Post created successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive',
      });
    },
  });

  if (!state.isAuthenticated || !state.user?.isCorporate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">This board is only accessible to corporate users.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPost.title.trim() && newPost.content.trim()) {
      createPostMutation.mutate(newPost);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('corporateBoard')}
            </h1>
            <p className="text-gray-600">
              Corporate discussion board for internal communications
            </p>
          </div>
          
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="samsung-gradient text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('createPost')}
          </Button>
        </div>

        {/* Create Post Form */}
        {showCreateForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Post</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Post title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  required
                />
                <Textarea
                  placeholder="Post content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={6}
                  required
                />
                <div className="flex space-x-2">
                  <Button 
                    type="submit" 
                    disabled={createPostMutation.isPending}
                  >
                    {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Posts List */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No posts yet
              </h3>
              <p className="text-gray-600 mb-4">
                Be the first to start a discussion in the corporate board.
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                Create First Post
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <p className="text-sm text-gray-500">
                    Posted on {new Date(post.createdAt!).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700">
                      {post.content}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
