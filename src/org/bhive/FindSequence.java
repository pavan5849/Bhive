package org.bhive;

import java.io.IOException;
import java.util.Stack;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class FindSequence extends HttpServlet
{
	private static final long serialVersionUID = -108315708781671528L;

	@Override
	public void doPost(HttpServletRequest  req, HttpServletResponse res) throws ServletException,IOException
	{
		doGet(req,res);
	}
	
	@Override
	public void doGet(HttpServletRequest  req, HttpServletResponse res) throws ServletException,IOException
	{
		String[] s=req.getParameter("distancemat").split(",");
		int len=Integer.parseInt(req.getParameter("len"));
		int[] distance[]=new int[len+1][len+1];
		int cnt=0;
		for(int i=1;i<=len;i++)
		{
			for(int j=1;j<=len;j++)
			{
				distance[i][j]=Integer.parseInt(s[cnt++]);
			}
		}
		TSPNearestNeighbour tsp=new TSPNearestNeighbour();
		String op=tsp.tsp(distance);
		res.setHeader("seq", op);
	}
}

class TSPNearestNeighbour
{
    private int numberOfNodes;
    private Stack<Integer> stack;
	private String op="";
	
    public TSPNearestNeighbour()
    {
        stack = new Stack<Integer>();
    }
 
    public String tsp(int adjacencyMatrix[][])
    {
        numberOfNodes = adjacencyMatrix[1].length - 1;
        int[] visited = new int[numberOfNodes + 1];
        visited[1] = 1;
        stack.push(1);
        int element, dst = 0, i;
        int min = Integer.MAX_VALUE;
        boolean minFlag = false;
        op+="1 ";
 
        while (!stack.isEmpty())
        {
            element = stack.peek();
            i = 1;
            min = Integer.MAX_VALUE;
            while (i <= numberOfNodes)
            {
                if (adjacencyMatrix[element][i] > 1 && visited[i] == 0)
                {
                    if (min > adjacencyMatrix[element][i])
                    {
                        min = adjacencyMatrix[element][i];
                        dst = i;
                        minFlag = true;
                    }
                }
                i++;
            }
            if (minFlag)
            {
                visited[dst] = 1;
                stack.push(dst);
                //System.out.print(dst + "\t");
                op+=dst+" ";
                minFlag = false;
                continue;
            }
            stack.pop();
        }
        return op;
    }
}